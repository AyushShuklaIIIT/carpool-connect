/**
 * Scrolls smoothly to the carpool form section on the page.
 */

const scrollToForm = () => {
    document.getElementById("carpool-form").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".steps");
    const benefit = document.querySelector(".benefits");
    function handleScroll() {
        const sectionTop = section.getBoundingClientRect().top;
        const benefitTop = benefit.getBoundingClientRect().top;
        if(sectionTop < window.innerHeight - 50) {
            section.classList.add("in-view");
        }
        if(benefitTop < window.innerHeight - 50) {    
            benefit.classList.add("in-view");
        }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();
})