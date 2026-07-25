# Ivy Playlist Builder — GitHub Pages版

GitHubユーザー: `gkkg9101`  
想定リポジトリ名: `ivy-playlist-builder`

公開URLとSpotify Redirect URI:

`https://gkkg9101.github.io/ivy-playlist-builder/`

## 公開手順（Pixel Tablet / iPhoneだけで可能）

1. GitHubで新しいPublic repositoryを作る
   - Repository name: `ivy-playlist-builder`
   - Add a READMEはオフでもオンでも可
2. ZIPを展開する
3. リポジトリの `Add file` → `Upload files`
4. このフォルダ内のファイルをすべてアップロードしてCommit
5. リポジトリの `Settings` → `Pages`
6. Sourceを `Deploy from a branch`
7. Branchを `main`、Folderを `/(root)` にしてSave
8. 数分後、次のURLが公開される
   - https://gkkg9101.github.io/ivy-playlist-builder/

## Spotify Dashboard

Spotify Developer Dashboardのアプリ設定でRedirect URIに次を完全一致で追加:

`https://gkkg9101.github.io/ivy-playlist-builder/`

末尾の `/` も含めてください。

## 使用

1. 公開URLを開く
2. Client IDを入力
3. Spotifyにログイン
4. 曲を検索
5. 「要確認」だけ候補を確認
6. Spotifyに作成

## セキュリティ

- Client Secretは不要
- OAuth Authorization Code with PKCE
- Client IDは端末のlocalStorage
- Access TokenはsessionStorage
- 外部移行サービスは不使用
