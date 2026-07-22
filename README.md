# KESUNKA

中高生向けの勉強ログPWA（Progressive Web App）と、その学習状況を保護者が閲覧できる専用ビューア「KESUNKA MAMA」です。

## 公開URL

| アプリ | URL |
|---|---|
| KESUNKA（本体・お子さん用） | https://watanabeops.github.io/kesunka/ |
| KESUNKA MAMA（保護者用ビューア） | https://watanabeops.github.io/kesunka/mama.html |

いずれもインストール不要で、上記URLをブラウザで開くだけで使えます。KESUNKAはiPadのSafariから「ホーム画面に追加」することで、アプリのような全画面表示・オフライン利用が可能になります（手順は[docs/setup-guide.md](docs/setup-guide.md)参照）。

## 主な機能

- 科目（固定11タグ＋そのほか）と時間（30分刻み）をタップで選んでセッションを記録
- 日別の目標設定・連続記録（ストリーク）表示
- 直近7日間の学習時間・科目別内訳を集計表示するダッシュボード（活動記録）
- データはブラウザのlocalStorageに保存（サーバー送信なし）。TXT/JSONでの手動バックアップ・読み込みに対応
- Firebase Firestoreを使った、保護者への一方向の学習状況共有（任意機能）
- ダークモード対応、PWA（ホーム画面追加・オフライン利用）対応

## 構成

```
index.html      本体アプリ（PWA版）
mama.html       保護者用ビューア（KESUNKA MAMA）
manifest.json   PWAマニフェスト
sw.js           Service Worker（オフラインキャッシュ）
icons/          PWAアイコン各種（192px, 512px, 512pxマスカブル）
docs/           セットアップ・運用ガイド
```

ビルド不要の単一HTMLファイル構成で、GitHub Pagesから直接配信しています（`main`ブランチ / ルート）。

## ドキュメント

- [docs/setup-guide.md](docs/setup-guide.md) — iPadへのインストール方法、更新時の注意点など
- [docs/firebase-setup-guide.md](docs/firebase-setup-guide.md) — 保護者への共有機能（Firebase）のセットアップ手順

## データとプライバシー

学習記録そのものは各端末のブラウザ内（localStorage）にのみ保存され、外部には送信されません。保護者共有機能をオンにした場合のみ、「今日/週の合計時間・科目別の内訳・目標達成率・連続記録」の要約データがFirebase Firestoreを通じて一方向に送信されます。メモの内容や日付ごとの詳細な記録は送信されません。

## 更新履歴

各HTMLファイル冒頭のコメントに変更履歴（Changelog）を記載しています。

## ライセンス

個人・家族利用を目的としたプロジェクトです。
