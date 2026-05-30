const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL 配置（改成你自己的）
const dbConfig = {
  host: 'localhost',
  user: '174623',
  password: '174623',
  database: 'users',
  port: 3306
};

// 注册接口
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // 1. 特殊字符校验
  const specialCharReg = /[^\u4e00-\u9fa5a-zA-Z0-9]/;
  if (specialCharReg.test(username)) {
    return res.json({ code: 0, msg: '账号不允许包含特殊字符！' });
  }

  // 2. 密码长度 ≥6
  if (password.length < 6) {
    return res.json({ code: 0, msg: '密码长度不能少于6位！' });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // 3. 检测账号是否存在
    const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.json({ code: 0, msg: '账号已存在！' });
    }

    // 4. 写入数据库
    await conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.json({ code: 1, msg: '注册成功！即将跳转到登录页' });

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
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

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

const PORT = 3306;
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});
