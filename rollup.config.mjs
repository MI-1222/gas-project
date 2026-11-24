import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import rollupPluginGas from "rollup-plugin-google-apps-script";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import fs from "fs";
import dotenv from "dotenv";

// プロジェクトディレクトリの定義
// const srcBaseDir = 'src';
const projectsDir = "src/app";
const distBaseDir = "dist";

const projects = fs
  .readdirSync(projectsDir, { withFileTypes: true })
  .map((dirent) => dirent.name);

console.log(projects);

// .envを読み込み（存在しない場合は空オブジェクト）
const envConfig = fs.existsSync(".env")
  ? dotenv.parse(fs.readFileSync(".env"))
  : {};
const envKeys = Object.keys(envConfig).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(envConfig[next]);
  return prev;
}, {});

// 環境変数のチェックプラグイン
const checkEnv = () => {
  return {
    name: "check-env",
    transform(code, id) {
      // process.envの残存をチェック
      const matches = code.match(/process\.env\.([A-Z_0-9]+)/g);
      if (matches) {
        matches.forEach((match) => {
          const varName = match.replace("process.env.", "");
          // 重複除外などは簡易的に
          console.warn(
            `\x1b[33mWarning: 環境変数 "${varName}" が .env に定義されていません\x1b[0m`,
          );
        });
      }
      return null;
    },
  };
};

// 共通プラグイン設定
const Plugins = [
  typescript({
    declaration: false,
    declarationMap: false,
  }),
  json(),
  commonjs(),
  rollupPluginGas(),
  nodeResolve(),
  replace({
    preventAssignment: true,
    values: envKeys,
  }),
  checkEnv(),
];

// 設定配列の生成
export default projects.map((project) => ({
  // エントリーポイント
  input: `${projectsDir}/${project}/index.ts`,
  output: {
    // 出力先設定
    file: `${distBaseDir}/${project}.js`,
    format: "iife", // 即時関数
  },
  plugins: Plugins,
}));
