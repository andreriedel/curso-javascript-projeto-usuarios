class UserController {
  constructor(formCreateId, formUpdateId, tableId) {
    this.formCreateEl = document.getElementById(formCreateId);
    this.formUpdateEl = document.getElementById(formUpdateId);
    this.tableEl = document.getElementById(tableId);

    this.boxCreateEl = this.formCreateEl.parentElement;
    this.boxUpdateEl = this.formUpdateEl.parentElement;

    this.onSubmit();
    this.onEdit();
  }  

  onSubmit() {
    this.formCreateEl.addEventListener("submit", (event) => {
      event.preventDefault();

      let btnSubmit = this.formCreateEl.querySelector("[type=submit]");

      btnSubmit.disabled = true;

      const values = this.getValues();

      if (!values) {
        btnSubmit.disabled = false;
        return false;
      }

      this.getPhoto()
      .then((content) => {
        values.photo = content;

        [...this.formCreateEl].forEach((field) => {
          if (field.type != "submit" && field.name != "admin" && field.name != "gender") {
            this.replaceClasses(field.parentElement, ["form-group"]);
          } else if (field.name == "gender") {
            this.replaceClasses(field.parentElement.parentElement.parentElement, ["form-group"]);
          }
        });

        this.formCreateEl.reset();
        btnSubmit.disabled = false;

        this.addLine(values);
      })
      .catch((event) => {
        console.error(event);
      });
    });
  }

  onEdit() {
    this.formUpdateEl.querySelector("[type=button").addEventListener("click", (e) => {
      this.showBox("create");
    });
  }

  getValues() {
    let user = {};
    let isValid = true;
    let isGenderSelected = false;

    [...this.formCreateEl].forEach((field) => {
      if (field.type != "submit" && field.name != "admin" && field.name != "gender") {
        if (!field.value) { // error or warning
          if (["name", "email", "password"].includes(field.name)) {
            this.replaceClasses(field.parentElement, ["form-group", "has-error"]);
            isValid = false;
          } else {
            this.replaceClasses(field.parentElement, ["form-group", "has-warning"]);
          }
        } else { // success
          this.replaceClasses(field.parentElement, ["form-group", "has-success"]);
        }
      }
    });    

    [...this.formCreateEl].forEach((field) => {
      if (field.name == "gender") {
        if (field.checked) {
          isGenderSelected = true;
          user[field.name] = field.value;
        }
      } else if (field.name == "admin") {
        user[field.name] = field.checked;
      } else {
        user[field.name] = field.value;
      }
    });

    const genderFormGroup = [...this.formCreateEl].filter((field) => {
      return field.name == "gender"
    })[0].parentElement.parentElement.parentElement;

    if (isGenderSelected) {
      this.replaceClasses(genderFormGroup, ["form-group", "has-success"])
    } else {
      this.replaceClasses(genderFormGroup, ["form-group", "has-warning"])
    }

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

      const file = [...this.formCreateEl].filter((item) => item.name == "photo")[0].files[0];
  
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

    tr.dataset.user = JSON.stringify(user);

    tr.innerHTML = `
      <td><img src="${user.photo}" alt="User Image" class="img-circle img-sm"></td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${(user.admin) ? "Sim" : "Não"}</td>
      <td>${Utils.formatDate(user.register)}</td>
      <td>
        <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
      </td>
    `;

    tr.querySelector(".btn-edit").addEventListener("click", (e) => {
      let json = JSON.parse(tr.dataset.user);

      for (let attr in json) {
        let field = this.formUpdateEl.querySelector("[name=" + attr.replace("_", "") + "]");

        if (field) { // excludes register
          switch (field.type) {
            case "file":
              continue;
              break;
            case "radio":
              field = this.formUpdateEl.querySelector("[name=" + attr.replace("_", "") + "][value=" + json[attr] + "]");
              field.checked = true;
              break;
            case "checkbox":
              field.checked = json[attr];
              break;
            default:
              field.value = json[attr];
              break;
          }
        }        
      }

      this.showBox("update");
    });

    this.tableEl.appendChild(tr);

    this.updateCount();
  }

  showBox(boxType) {
    if (boxType == "create") {
      this.boxCreateEl.style.display = "block";
      this.boxUpdateEl.style.display = "none";
    }
    
    if (boxType == "update") {
      this.boxCreateEl.style.display = "none";
      this.boxUpdateEl.style.display = "block";
    }
  }

  updateCount() {
    let usersCount = 0;
    let adminsCount = 0;

    [...this.tableEl.children].forEach((tr) => {
      usersCount++;

      let user = JSON.parse(tr.dataset.user);
      if (user._admin) adminsCount++;
    });

    document.querySelector("#users-count").innerHTML = usersCount;
    document.querySelector("#admins-count").innerHTML = adminsCount;
  }
}
