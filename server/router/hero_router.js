const express = require('express');
const router = express.Router();

// 引入封装好的连接数据库的模块
const conn = require('../util/sql.js');
// 引入multer模块 接收文件
const multer = require('multer');
const sql = require('../util/sql.js');
// 精细化去设置，如何去保存文件
const storage = multer.diskStorage({
    // 保存在哪里
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    // 保存时，文件名叫什么
    filename: function (req, file, cb) {
        console.log('file', file)
        // 目标： 新名字是时间戳+后缀名
        const filenameArr = file.originalname.split('.');
        // filenameArr.length-1是找到最后一个元素的下标
        const fileName = Date.now() + "." + filenameArr[filenameArr.length - 1]
        cb(null, fileName)
    }
})
let upload = multer({ storage })

// 下面代码 实现获取普通键值对形式的参数
router.use(express.urlencoded());

// 接口1：获取所有英雄
router.get('/getHeroList', (req, res) => {
    // 获取传入的参数
    // console.log(req.query); // get 请求的参数在req.query里面
    const { heroName } = req.query;
    // 拼接sql语句
    let sqlStr = `select id, name, gender, img from heros where isdelete=0`;
    // 判断 如果用户传入参数 就是查询单个某个英雄
    if (heroName) {
        sqlStr += ` and name="${heroName}"`
    }
    // console.log(sqlStr);
    // 执行sql
    conn.query(sqlStr, (err, result) => {
        // console.log(err);
        if (err) {
            res.status(500).json({ msg: '服务器错误', code: 500 });
            return;
        }

        res.json({ msg: '请求成功', code: 200, data: result });
    });

})

// 接口2：添加英雄数据
router.post('/addHero', (req, res) => {
    // 获取参数
    // console.log(req.body);
    const { name, gender } = req.body;
    if (!name || !gender) {
        res.status(400).json({ msg: '请传入参数', code: 400 });
        return;
    }
    // 拼接sql语句
    const sqlStr = `insert into heros (name, gender) values("${name}", "${gender}")`;
    // 查询语句
    let sqlStr1 = `select name from heros where isdelete=0 and name="${name}"`;
    // console.log(sqlStr);
    // 添加之前先判断英雄是否已经存在
    conn.query(sqlStr1, (err, result) => {
        if (err) {
            return;
        }
        // console.log(result.length);
        if (result.length > 0) {
            res.json({ msg: '你添加的英雄已经存在', code: 201 });
            return;
        }
        conn.query(sqlStr, (err, result) => {
            if (err) {
                res.status(500).json({ msg: '服务器错误', code: 500 });
                return;
            }
            res.json({ msg: '添加成功', code: 200 });
        });
    });

})

// 接口3：删除单个英雄
router.get('/delHeroById', (req, res) => {
    // 获取参数
    // console.log(req.query);
    const { id } = req.query;
    // 拼接sql语句
    const sqlStr = `update heros set isdelete=1 where id=${id}`;
    // console.log(sqlStr);
    // 执行sql 
    conn.query(sqlStr, (err, result) => {
        if (err) {
            res.status(500).json({ msg: '服务器错误', code: 500 });
            return;
        }
        res.json({ msg: '删除成功', code: 200 });
    });
})

// 特殊接口：上传文件
router.post('/uploadFile', upload.single('file_data'), (req, res) => {
    // 获取到文件
    // console.log(req.file);
    // 上传成功
    res.json({
        "code": 200,
        "msg": "上传成功",
        "src": "http://127.0.0.1:3001/uploads/" + req.file.filename
    })
})

// 接口5：更新英雄数据
router.post('/updateHero', (req, res) => {
    // 获取参数
    // console.log(req.body);
    const { id, name, gender, img } = req.body;
    // 定义空数组 接收要更改内容来拼接的sql语句
    // 判断
    let condition = []
    if (name) {
        condition.push(`name="${name}"`)
    }
    if (gender) {
        condition.push(`gender="${gender}"`)
    }
    if (img) {
        condition.push(`img="${img}"`)
    }
    // 用join可以把数组内容转成字符串 用逗号分隔
    const conditionStr = condition.join();
    // console.log(conditionStr);
    // 拼接sql语句
    const sqlStr = `update heros set ${conditionStr} where id=${id} and isdelete=0`;
    // 执行sql
    conn.query(sqlStr, (err, result) => {
        if (err) {
            res.status(500).json({ msg: '修改错误', code: 500 });
            return;
        }
        res.json({ msg: '修改成功', code: 200 });
    });
})


// 导出
module.exports = router;