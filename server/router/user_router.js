const express = require('express');
const router = express.Router();
// 引入封装好的连接数据库的模块
const conn = require('../util/sql.js');
// 实现token的包
const jwt = require('jsonwebtoken');

// 下面代码 实现获取普通键值对形式的参数
router.use(express.urlencoded());

// 注册接口
router.post('/register', (req, res) => {
    // 获取参数
    // console.log(req.body);
    const { userName, userPwd } = req.body;
    // 先去看用户名有没有被占用
    // 拼接查询语句
    const sqlStr = `select username from user where username="${userName}"`;
    // 执行查询
    conn.query(sqlStr, (err, result) => {
        if (err) {
            res.status(500).json({ msg: '服务器错误', code: 500 });
        }
        // 判断 如果result长度大于0 说明名字被占用了
        if (result.length > 0) {
            res.json({ msg: '名字已被占用', code: 201 });
            return;
        }
        // 名字没有被占用
        const sqlStr2 = `insert into user (username, password) values ("${userName}", "${userPwd}")`;
        // 执行添加
        conn.query(sqlStr2, (err, result) => {
            if (err) {
                res.status(500).json({ msg: '服务器错误', code: 500 });
                return;
            }
            res.json({ msg: '注册成功', code: 200 });
        });
    });
});
// 登录接口
router.post('/login', (req, res) => {
    // 获取参数
    // console.log(req.body);
    const { userName, userPwd } = req.body;
    // 拼接sql语句 
    // 去查询 如果名字和密码都相同 就是登陆成功
    const sqlStr = `select * from user where username="${userName}" and password="${userPwd}"`;
    // 执行sql
    conn.query(sqlStr, (err, result) => {
        if (err) {
            res.status(500).json({ msg: '服务器错误', code: 500 });
            return;
        }
        // console.log(result);
        if (result.length > 0) {
            // 调用生成 token 的方法
            const tokenStr = jwt.sign({ name: userName }, 'gz61', { expiresIn: 2 * 60 * 60 });
            const token = 'Bearer ' + tokenStr
            res.json({ msg: '登陆成功', code: 200, token })
        } else {
            res.json({ msg: '用户名密码不正确', code: 201 });
        }
    });
});

// 导出
module.exports = router;