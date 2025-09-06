// /chart-log/assets/site.js
document.addEventListener('DOMContentLoaded', () => {
  // 既に挿入済みなら二重挿入を防止
  if (document.querySelector('.topbar')) return;

  const bar = document.createElement('div');
  bar.className = 'topbar';
  bar.innerHTML = `
    <a class="home" href="/chart-log/">chart-log トップへ</a>
  `;
  // body先頭へ
  document.body.prepend(bar);
});
