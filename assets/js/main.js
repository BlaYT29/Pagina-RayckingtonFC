/* ===================================================
   RAYCKINGTON FC
   MAIN JS
=================================================== */


/* ===================================================
   ESPERA CARGA COMPLETA
=================================================== */


document.addEventListener("DOMContentLoaded",()=>{


    document.body.classList.add("loaded");


});



/* ===================================================
   NAVBAR SCROLL
=================================================== */


const navbar = document.getElementById("navbar");


window.addEventListener("scroll",()=>{


    if(!navbar) return;


    if(window.scrollY > 80){


        navbar.classList.add("navbar-scrolled");


    }else{


        navbar.classList.remove("navbar-scrolled");


    }


});



/* ===================================================
   SCROLL SUAVE
=================================================== */


document.querySelectorAll('a[href^="#"]').forEach(link=>{


    link.addEventListener("click",(e)=>{


        const target = document.querySelector(
            link.getAttribute("href")
        );


        if(target){


            e.preventDefault();


            target.scrollIntoView({


                behavior:"smooth"


            });


        }


    });


});



/* ===================================================
   ANIMACIONES AL HACER SCROLL
=================================================== */


const animatedElements = document.querySelectorAll(

    ".section, .player-card, .news-card, .card-custom, .match-card"

);



const observer = new IntersectionObserver(

(entries)=>{


    entries.forEach(entry=>{


        if(entry.isIntersecting){


            entry.target.classList.add("fade-up","show");


        }


    });


},


{

    threshold:.15

}



);



animatedElements.forEach(element=>{


    observer.observe(element);


});



/* ===================================================
   CONTADORES
=================================================== */


const counters = document.querySelectorAll(".counter");



const startCounter = (counter)=>{


    const target = +counter.dataset.target;


    let current = 0;


    const increment = target / 100;



    const update = ()=>{


        current += increment;



        if(current < target){


            counter.innerText = Math.ceil(current);


            requestAnimationFrame(update);


        }else{


            counter.innerText = target;


        }


    };


    update();


};



const counterObserver = new IntersectionObserver(

(entries)=>{


    entries.forEach(entry=>{


        if(entry.isIntersecting){


            startCounter(entry.target);


            counterObserver.unobserve(entry.target);


        }


    });



},

{

threshold:.7

}



);



counters.forEach(counter=>{


    counterObserver.observe(counter);


});



/* ===================================================
   BOTÓN VOLVER ARRIBA
=================================================== */


const backTop = document.createElement("button");


backTop.className="back-top";


backTop.innerHTML = `

<i class="bi bi-arrow-up"></i>

`;



document.body.appendChild(backTop);



window.addEventListener("scroll",()=>{


    if(window.scrollY > 500){


        backTop.classList.add("active");


    }else{


        backTop.classList.remove("active");


    }


});



backTop.addEventListener("click",()=>{


    window.scrollTo({


        top:0,


        behavior:"smooth"


    });


});



/* ===================================================
   HOVER TARJETAS
=================================================== */


const cards = document.querySelectorAll(

    ".player-card, .news-card, .card-custom"

);



cards.forEach(card=>{


    card.addEventListener("mousemove",(e)=>{


        const rect = card.getBoundingClientRect();


        const x = e.clientX - rect.left;


        const y = e.clientY - rect.top;



        card.style.background = `

        radial-gradient(

        circle at ${x}px ${y}px,

        rgba(255,255,255,.12),

        #151515 60%

        )

        `;


    });



    card.addEventListener("mouseleave",()=>{


        card.style.background="";


    });


});



/* ===================================================
   AÑO AUTOMÁTICO FOOTER
=================================================== */


const year = document.querySelector("#year");


if(year){


    year.innerText = new Date().getFullYear();


}



/* ===================================================
   CONSOLE
=================================================== */


console.log(

"⚽ Rayckington FC Website cargado correctamente"

);