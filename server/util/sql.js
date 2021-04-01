// 连接数据库
module.exports = {
    query: function (sql, callback) {
        const mysql = require('mysql');
        const conn = mysql.createConnection({
            host: 'localhost',   // 你要连接的数据库服务器的地址
            user: 'root',        // 连接数据库服务器需要的用户名
            password: 'root',        // 连接数据库服务器需要的密码
            database: 'gordon'      //你要连接的数据库的名字
        });
        conn.connect();
        // 完成增删改查
        conn.query(sql, callback);
        // 手动关闭连接
        conn.end();
    }
}