// edit comment 
const editButtons = document.querySelectorAll(".edit-button");
const form = document.querySelectorAll(".comment .form-edit");
const comment = document.querySelectorAll(".comment-text");
const commentToolbar = document.querySelectorAll(".comment-toolbar");
const cancelButton = document.querySelectorAll(".cancel");

for (let i = 0; i < editButtons.length; i++) {
    let index = Math.floor(i / 2);              // since there are 2 edit buttons on each comment, index is used to select the correct edit form

    editButtons[i].addEventListener("click", () => {
        // Hide the comment and the toolbar first
        comment[index].style.opacity = 0;
        commentToolbar[index].style.opacity = 0;
        // remove the comment after 150ms by making display: none
        setTimeout(showForm, 150, index);
    });

    cancelButton[index].addEventListener("click", () => {
        // hide form then make display: none
        form[index].style.opacity = 0;
        setTimeout(hideForm, 150, index);
    });
}

function hideForm(index) {
    form[index].classList.remove("display-block");
    comment[index].classList.remove("display-none");
    commentToolbar[index].classList.remove("display-none");
    setTimeout( function(index) {
        comment[index].style.opacity = 1;
        commentToolbar[index].style.opacity = 1;
    }, 100, index);
}

function showForm(index) {
    form[index].classList.add("display-block");
    comment[index].classList.add("display-none");
    commentToolbar[index].classList.add("display-none");
    setTimeout( function(index) {
        form[index].style.opacity = 1;
    }, 100, index);
}

