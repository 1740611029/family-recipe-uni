-- 家庭菜谱 D1 数据库表结构

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  ingredients TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  recommendDate TEXT DEFAULT '',
  createTime TEXT DEFAULT '',
  updateTime TEXT DEFAULT ''
);

-- 兼容已有库：若无 recommendDate 列则追加
-- D1/SQLite 不支持 IF NOT EXISTS，用 pragma 防御性判断
-- 实际部署时，如已存在旧表，可手动执行：
-- ALTER TABLE recipes ADD COLUMN recommendDate TEXT DEFAULT '';

-- 创建时间索引（用于按时间倒序查询）
CREATE INDEX IF NOT EXISTS idx_recipes_createTime ON recipes(createTime DESC);

-- 推荐日期索引（用于"今日推荐"查询）
CREATE INDEX IF NOT EXISTS idx_recipes_recommendDate ON recipes(recommendDate);
