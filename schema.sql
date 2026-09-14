-- 家庭菜谱 D1 数据库表结构

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  ingredients TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  createTime TEXT DEFAULT '',
  updateTime TEXT DEFAULT ''
);

-- 创建时间索引（用于按时间倒序查询）
CREATE INDEX IF NOT EXISTS idx_recipes_createTime ON recipes(createTime DESC);
