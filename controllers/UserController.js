class UserController {
  constructor(formId, tableId) {
    this.formEl = document.getElementById(formId);
    this.tableEl = document.getElementById(tableId);

    this.onSubmit();
  }

  onSubmit() {
    this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();

      let btnSubmit = this.formEl.querySelector("[type=submit]");

      btnSubmit.disabled = true;

      const values = this.getValues();

      if (!values) {
        btnSubmit.disabled = false;
        return false;
      }

      this.getPhoto()
      .then((content) => {
        values.photo = content;
        this.addLine(values);

        btnSubmit.disabled = false;
        this.formEl.reset();
        [...this.formEl.elements].forEach((field) => {
          this.replaceClasses(field.parentElement, ["form-group"]);
        })
      })
      .catch((event) => {
        console.error(event);
      });
    });
  }

  getValues() {
    let user = {};
    let isValid = true;

    [...this.formEl.elements].forEach((field) => {
      if (["name", "email", "password"].includes(field.name) && !field.value) {
        this.replaceClasses(field.parentElement, ["form-group", "has-error"]);
        isValid = false;
      } else if (!field.value) {
        this.replaceClasses(field.parentElement, ["form-group", "has-warning"]);
      } else {
        this.replaceClasses(field.parentElement, ["form-group", "has-success"]);
      }

      if (field.name === "gender") {
        if (field.checked) {
          user[field.name] = field.value;
        }
      } else if (field.name === "admin") {
        user[field.name] = field.checked;
      } else {
        user[field.name] = field.value;
      }
    });

    if (!isValid) return false;
  
    return new User(
      user.name,
      user.gender,
      user.birth,
      user.country,
      user.email,
      user.password,
      user.photo,
      user.admin
    );
  }

  getPhoto() {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      const file = [...this.formEl.elements].filter((item) => item.name === "photo")[0].files[0];
  
      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (event) => {
        reject(event);
      };
  
      if (file) {
        fileReader.readAsDataURL(file);
      } else {
        resolve("imgs/defaultuser.jpg");
      }
    });
  }

  replaceClasses(element, classes) {
    element.classList.value = "";
    classes.forEach((el) => {
      element.classList.add(el);
    });
  }

  addLine(user) {
    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td><img src="${user.photo}" alt="User Image" class="img-circle img-sm"></td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${(user.admin) ? "Sim" : "Não"}</td>
      <td>${Utils.formatDate(user.register)}</td>
      <td>
        <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
      </td>
    `;

    this.tableEl.appendChild(tr);
  }
}
