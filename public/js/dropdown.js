const dropdownButtons   = document.querySelectorAll(".dropdown.button");
const menuList          = document.querySelectorAll(".dropdown.button + .menu");
let hideId;

for (let i = 0; i < dropdownButtons.length; i++) {
    // toggle the display of overflow list
    dropdownButtons[i].addEventListener("click", () => {
        if (menuList[i].classList.contains("visible")) {
            menuList[i].classList.remove("opacity-one");
        } else {
            menuList[i].classList.add("visible");
            menuList[i].classList.add("opacity-one");
        }
    });

    // hide the overflow list after completing all the subsequent events (button links) 
    dropdownButtons[i].addEventListener("focusout", () => {
        hideId = setTimeout(hideFunc, 0, i);
    });

    dropdownButtons[i].addEventListener("focusin", () => {
        clearTimeout(hideId);
    });

    menuList[i].addEventListener("focusout", () => {
        hideId = setTimeout(hideFunc, 0, i);
    });

    menuList[i].addEventListener("focusin", () => {
        clearTimeout(hideId);
    });

    menuList[i].addEventListener("transitionend", () => {
        if (!menuList[i].classList.contains("opacity-one")) {
            menuList[i].classList.remove("visible");
        }
        event.stopPropagation();
    });
}

function hideFunc(index) {
    menuList[index].classList.remove("opacity-one");
}