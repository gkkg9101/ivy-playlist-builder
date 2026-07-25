# Ivy Playlist Builder v2

Spotify Web API + Authorization Code with PKCE を使う、GitHub Pages向けの静的アプリです。

## 更新方法

リポジトリ `gkkg9101/ivy-playlist-builder` のルートにある次の3ファイルを、このフォルダの同名ファイルで上書きします。

- `index.html`
- `app.js`
- `style.css`

README.md は任意です。.nojekyll はなくても動きます。

## v2の変更点

- 検索を1種類から複数段階へ改善
- 英語名とSpotify日本語表示名の代表的な表記ゆれを吸収
- アーティスト不一致の誤爆を抑制（例: Arca / Mary Arcane）
- 未一致だけ再検索
- 1曲だけ検索語を変えて再検索
- Spotify曲URL / URIで手動固定
- 一度確定した曲を端末内に保存
- 曲目を編集しても既存の照合結果をなるべく保持

## Redirect URI

Spotify Dashboardに以下を完全一致で登録します。

`https://gkkg9101.github.io/ivy-playlist-builder/`
