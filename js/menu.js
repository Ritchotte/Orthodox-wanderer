

(function(d) {

    const nav = d.querySelector('nav');
    const btn = d.querySelector('.menu-toggle');

    if (btn && nav) {

        btn.addEventListener('click', function() {

            
            nav.classList.toggle('nav-open');

            
            if (btn.innerHTML === '&#9776;') {
                btn.innerHTML = '&#10005;';
            } else {
                btn.innerHTML = '&#9776;';
            }

        });

    }

})(document);
