document.querySelector("#form-user-create").addEventListener("submit", (event) => {
  event.preventDefault();
  
  let user;
  let fields = document.querySelectorAll("form-user-create [name]");

  fields.forEach((field) => {
    if (field.name == "gender") {
      if (field.checked) {
        user[field.name] = field.value;
      }
    } else {
      user[field.name] = field.value;
    }
  });
});
