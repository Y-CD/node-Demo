// 导入express包
const express = require('express')
// 创建服务
const server = express()
// 静态托管文件夹
server.use('/uploads', express.static('uploads'));
// 引入包cors解决跨域问题
const cors = require('cors');
server.use(cors());
// 验证token的包
const jwt = require('express-jwt');
// app.use(jwt().unless());
// jwt() 用于解析token，并将 token 中保存的数据 赋值给 req.user
// unless() 约定某个接口不需要身份认证
server.use(jwt({
    secret: 'gz61', // 生成token时的 钥匙，必须统一
    algorithms: ['HS256'] // 必填，加密算法，无需了解
}).unless({
    path: ['/user/login', '/user/register', /^\/uploads\/.*/] // 除了这两个接口，其他都需要认证
}));

// 引入自定义模块
const userRouter = require('./router/user_router.js');
const heroRouter = require('./router/hero_router.js');
server.use('/user', userRouter);
server.use('/hero', heroRouter);

server.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // res.status(401).send('invalid token...');
        res.status(401).send({ status: 1, message: '身份认证失败！' });
    }
});

// 启动服务器
server.listen(3001, () => console.log('服务器启动成功提示'))