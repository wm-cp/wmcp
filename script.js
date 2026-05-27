// 导航切换内容交互
const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.content-panel');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // 切换菜单高亮
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // 切换内容显示
        const target = item.getAttribute('data-target');
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById(target).classList.add('active');
    });
});
