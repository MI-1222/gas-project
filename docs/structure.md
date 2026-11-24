# プロジェクト構造 (`docs/structure.md`)

```mermaid
graph TD
  Root["プロジェクトルート"]
  Root --> Src["src/"]
  Root --> Dist["dist/"]

  subgraph settings [設定ファイル]
    package_json(("package.json"))
    rollup_config_js(("rollup.config.mjs"))
    tsconfig_json(("tsconfig.json"))
  end
  Root --> package_json
  Root --> rollup_config_js
  Root --> tsconfig_json

  subgraph gasSettings [GAS設定ファイル]
    appsscript_json(("appsscript.json"))
    _clasp_json((".clasp.json"))
    _claspignore((".claspignore"))
  end
  Root --> appsscript_json
  Root --> _clasp_json
  Root --> _claspignore

  Src --> src__type_d_ts(("type.d.ts"))

  subgraph otherSrcFolder [その他フォルダ]
    SrcComponentsFolder["components/"]
    SrcModelsFolder["models/"]
    SrcUtilsFolder["utils/"]
    SrcTypesFolder["types/"]

    SrcComponentsFolder --> srcComponents__hello__ts(("hello.ts"))

    SrcModelsFolder --> srcModels__DiscordClient_ts(("DiscordClient.ts"))
    SrcModelsFolder --> srcModels__GmailClient_ts(("GmailClient.ts"))
    SrcModelsFolder --> srcModels__GsheetClient_ts(("GsheetClient.ts"))

    SrcUtilsFolder --> srcUtils__allOrNone_ts(("allOrNone.ts"))

    SrcTypesFolder --> srcTypes__mail_ts(("mail.ts"))
    SrcTypesFolder --> srcTypes__targetCell_ts(("targetCell.ts"))
  end
  Src --> SrcComponentsFolder
  Src --> SrcModelsFolder
  Src --> SrcUtilsFolder
  Src --> SrcTypesFolder

  subgraph srcAppFolder [プロジェクトフォルダ]
    SrcApp["app/"]

    SrcApp --> SrcApp__hello["hello/"]
    SrcApp__hello --> srcApp__hello_index_ts(("index.ts"))
  end
  Src --> SrcApp

  subgraph distFolder [出力ファイル]
    distApp__hello_js(("hello.js"))
  end
  Dist --> distApp__hello_js
```

他のスクリプトでも共有して使うファイルは`src/`の各フォルダ（`models`, `utils`, `components`など）に配置し、
プロジェクト固有で使うファイルは`src/app/`内のプロジェクトフォルダにそれぞれ配置する。
(なるべく`index.ts`は呼び出しのみに専念するようにし、`index.ts`の見通しが良いようにする。)
