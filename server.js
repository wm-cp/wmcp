const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();

// 中间件
app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL 8.0.12 连接配置（修改为你的数据库信息）
const dbConfig = {
  host: 'localhost',
  user: 'root',         // 你的数据库用户名
  password: '123456',   // 你的数据库密码
  database: 'user_system',
  port: 3306
};

// 注册接口
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // 1. 校验：账号不能包含特殊字符（只允许字母、数字、中文）
  const specialCharReg = /[^\u4e00-\u9fa5a-zA-Z0-9]/;
  if (specialCharReg.test(username)) {
    return res.json({ code: 0, msg: '账号不允许包含特殊字符！' });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // 2. 检测账号是否已存在
    const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.json({ code: 0, msg: '账号已存在！' });
    }

    // 3. 写入数据库
    await conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.json({ code: 1, msg: '注册成功！' });

  } catch (err) {
    res.json({ code: 0, msg: '服务器错误：' + err.message });
  } finally {
    if (conn) conn.end();
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    
    if (rows.length > 0) {
      res.json({ code: 1, msg: '登录成功！' });
    } else {
      res.json({ code: 0, msg: '账号或密码错误！' });
    }
  } catch (err) {
    res.json({ code: 0, msg: '服务器错误' });
  } finally {
    if (conn) conn.end();
  }
});

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务运行在：http://localhost:${PORT}`);
});
