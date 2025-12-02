/**
 * スクリーンショット自動生成スクリプト
 * 
 * 使用方法:
 * 1. ローカルで `npm run dev` を起動
 * 2. 別ターミナルで `npm run screenshots` を実行
 * 
 * 注意: ログインが必要なページは手動でログインしてから実行してください。
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = join(process.cwd(), 'docs', 'screenshots');

// スクリーンショットディレクトリを作成
mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function generateScreenshots() {
  console.log('🚀 スクリーンショット生成を開始します...');
  console.log(`📸 ベースURL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // 1. ログインページ
    console.log('📸 ログインページを撮影中...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'login.png'),
      fullPage: true,
    });
    console.log('✅ login.png を保存しました');

    // 2. サインアップページ
    console.log('📸 サインアップページを撮影中...');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'signup.png'),
      fullPage: true,
    });
    console.log('✅ signup.png を保存しました');

    // 3. 新規作成ページ（ログインが必要な場合はスキップ）
    console.log('📸 新規作成ページを撮影中...');
    try {
      await page.goto(`${BASE_URL}/new`, { waitUntil: 'networkidle', timeout: 5000 });
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'new-document.png'),
        fullPage: true,
      });
      console.log('✅ new-document.png を保存しました');
    } catch (e) {
      console.log('⚠️  新規作成ページはログインが必要なためスキップしました');
    }

    // 4. 設定ページ（ログインが必要な場合はスキップ）
    console.log('📸 設定ページを撮影中...');
    try {
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: 5000 });
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'settings.png'),
        fullPage: true,
      });
      console.log('✅ settings.png を保存しました');
    } catch (e) {
      console.log('⚠️  設定ページはログインが必要なためスキップしました');
    }

    // 5. ログインページ（既に撮影済みだが、README用に追加）
    // login.png は既に生成済み

    // 6. サインアップページ（既に撮影済みだが、README用に追加）
    // signup.png は既に生成済み

    console.log('✅ スクリーンショット生成が完了しました！');
    console.log(`📁 保存先: ${SCREENSHOT_DIR}`);
    console.log('\n📝 注意: document-detail.png と share-view.png は手動で撮影してください。');
    console.log('   - document-detail.png: ログイン後、任意のドキュメント詳細ページ');
    console.log('   - share-view.png: 共有リンクの公開ビューページ');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generateScreenshots();

