const dropdownButtons = document.querySelectorAll(".dropdown.button");
const menuList = document.querySelectorAll(".dropdown.button + .menu");
let hideId;

for (let i = 0; i < dropdownButtons.length; i++) {
    // toggle the display of overflow list
    dropdownButtons[i].addEventListener("click", () => {
        if (menuList[i].classList.contains("display-overflow")) {
            menuList[i].classList.remove("animation-display");
        } else {
            menuList[i].classList.add("display-overflow");
            menuList[i].classList.add("animation-display");
        };
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
        if (!menuList[i].classList.contains("animation-display")) {
            menuList[i].classList.remove("display-overflow");
        }
        event.stopPropagation();
    });

    // shitty approach
    // let hideOverflow = true;
    // let buttonList = menuList[i].children[0].children[0].children;   
    // for (let i = 0; i < buttonList.length; i++) {
    //     buttonList[i].addEventListener("focus", () => {
    //         hideOverflow = false;
    //     });
    //     buttonList[i].addEventListener("focusout", () => {
    //         hideOverflow = true;
    //     });
    // }
    // dropdownButtons[i].addEventListener("focusout", () => {
    //     hideOverflow = true;
    // }); 
    // buttonGroup[i].addEventListener("focusout", (event) => {
    //    if (hideOverflow) {
    //         menuList[i].classList.remove("animation-display");
    //     } 
    // })

}

function hideFunc(index) {
    menuList[index].classList.remove("animation-display");
}