class UserController {
  constructor(formCreateId, formUpdateId, tableId) {
    this.formCreateEl = document.getElementById(formCreateId);
    this.formUpdateEl = document.getElementById(formUpdateId);
    this.tableEl = document.getElementById(tableId);

    this.boxCreateEl = this.formCreateEl.parentElement;
    this.boxUpdateEl = this.formUpdateEl.parentElement;

    this.onSubmit(); // Controla as ações após o usuário submeter o formulário.
    this.onEdit(); // Controla as ações após o usuário editar um cadastro.

    // Adiciona na tabela os usuários armazenados no local storage.
    this.insertUsersInTable();
  }

  onSubmit() {
    // Reseta o formulário ao carregar a página.
    this.formCreateEl.reset();

    this.formCreateEl.addEventListener("submit", (event) => {
      event.preventDefault(); // Previne o comportamento padrão do formulário.

      let btnSubmit = this.formCreateEl.querySelector("[type=submit]");

      // Desativa o botão submit enquanto os dados são processados.
      btnSubmit.disabled = true;

      // Obtém os dados do formulário.
      const user = this.getValues(this.formCreateEl);

      /*
       * Interrompe o método onSubmit se o método getValues retornar false.
       * Esse comportamento ocorre quando os campos do formulário estão
       * incompletos.
       */
      if (!user) {
        btnSubmit.disabled = false; // Ativa o botão submit novamente.
        return false;
      }

      // Obtém uma promessa do método getPhoto.
      this.getPhoto(this.formCreateEl)
        .then((content) => {
          user.photo = content;

          // Adiciona o usuário local storage.
          this.insertInLocalStorage(user);

          // Adiciona uma linha na tabela com o novo cadastro.
          this.addLine(user);

          this.formCreateEl.reset(); // Reseta os campos do formulário.

          // Limpa a imagem do campo photo.
          this.formCreateEl.querySelector("#form-user-create .photo").src =
            "imgs/defaultuser.jpg";

          // Limpa as classes de estilo dos campos do formulário.
          [...this.formCreateEl].forEach((field) => {
            if (
              field.type != "submit" &&
              field.name != "admin" &&
              field.name != "gender"
            ) {
              this.replaceClasses(field.parentElement, ["form-group"]);
            }

            if (field.name == "gender") {
              this.replaceClasses(
                field.parentElement.parentElement.parentElement,
                ["form-group"]
              );
            }
          });

          btnSubmit.disabled = false; // Ativa o botão submit novamente.
        })
        .catch((event) => {
          console.error(event);
        });
    });

    let photoBtn = this.formCreateEl.querySelector("input[type=file]");

    photoBtn.addEventListener("change", () => {
      this.getPhoto(this.formCreateEl)
        .then((content) => {
          // Adiciona o caminho do arquivo no campo photo.
          this.formCreateEl.querySelector("#form-user-create .photo").src =
            content;
        })
        .catch((event) => {
          console.error(event);
        });
    });
  }

  onEdit() {
    // Reseta o formulário ao carregar a página.
    this.formUpdateEl.reset();

    // Exibe o box do formulário de criação ao clicar em cancelar.
    this.formUpdateEl
      .querySelector("[type=button]")
      .addEventListener("click", () => {
        this.showBox("create");
      });

    this.formUpdateEl.addEventListener("submit", (event) => {
      event.preventDefault(); // Previne o comportamento padrão do formulário.

      let btnSubmit = this.formUpdateEl.querySelector("[type=submit]");

      // Desativa o botão submit enquanto os dados são processados.
      btnSubmit.disabled = true;

      // Obtém os dados do formulário.
      const user = this.getValues(this.formUpdateEl);

      /*
       * Interrompe o método onEdit se o método getValues retornar false.
       * Esse comportamento ocorre quando os campos do formulário estão incompletos.
       */
      if (!user) {
        btnSubmit.disabled = false; // Ativa o botão submit novamente.
        return false;
      }

      // Obtém uma promessa do método getPhoto.
      this.getPhoto(this.formUpdateEl)
        .then((content) => {
          // Obtém o índice do cadastro armazenado no dataset do formulário.
          const index = this.formUpdateEl.dataset.trIndex;

          // Seleciona o elemento tr correspondente ao índice.
          let tr = this.tableEl.rows[index];

          // Obtém os dados do dataset da tr.
          let userOld = JSON.parse(tr.dataset.user);

          // Mescla os objetos da tr com os dados do formulário de edição.
          let resultUserObj = Object.assign({}, userOld, user);

          // Se não for selecionado foto durante a edição, mantém foto antiga.
          if (!user.photo) {
            resultUserObj._photo = userOld._photo;
          } else {
            resultUserObj._photo = content;
          }

          // Edita a linha da tabela com os dados do formulário.
          this.editLine(tr, resultUserObj);

          this.formUpdateEl.reset(); // Reseta os campos do formulário.

          // Limpa a imagem do campo photo.
          this.formUpdateEl.querySelector("#form-user-update .photo").src =
            "imgs/defaultuser.jpg";

          // Limpa as classes de estilo dos campos do formulário.
          [...this.formUpdateEl].forEach((field) => {
            if (
              field.type != "submit" &&
              field.type != "button" &&
              field.name != "admin" &&
              field.name != "gender"
            ) {
              this.replaceClasses(field.parentElement, ["form-group"]);
            }

            if (field.name == "gender") {
              this.replaceClasses(
                field.parentElement.parentElement.parentElement,
                ["form-group"]
              );
            }
          });

          btnSubmit.disabled = false; // Ativa o botão submit novamente.

          // Exibe o box do formulário de criação.
          this.showBox("create");
        })
        .catch((event) => {
          console.error(event);
        });
    });

    let photoBtn = this.formUpdateEl.querySelector("input[type=file]");

    photoBtn.addEventListener("change", () => {
      this.getPhoto(this.formUpdateEl)
        .then((content) => {
          // Adiciona o caminho do arquivo no campo photo.
          this.formUpdateEl.querySelector("#form-user-update .photo").src =
            content;
        })
        .catch((event) => {
          console.error(event);
        });
    });
  }

  getValues(formEl) {
    let user = {};
    let isValid = true;
    let isGenderSelected = false;

    /**
     * Adiciona classes de estilização nos campos do formulário e verifica se
     * ele é válido.
     * A condição exclui alguns campos dessa verificação, pois esses campos
     * possuem comportamento diferente.
     */
    [...formEl].forEach((field) => {
      if (
        field.type != "submit" &&
        field.type != "button" &&
        field.name != "admin" &&
        field.name != "gender"
      ) {
        if (!field.value) {
          /**
           * Verifica se o campo do formulário em branco é um campo obrigatório.
           * Se for obrigatório, adiciona classe de estilização "has-error" e
           * marca o formulário como inválido.
           * Se não for obrigatório, adiciona classe de estilização
           * "has-warning".
           */
          if (["name", "email", "password"].includes(field.name)) {
            this.replaceClasses(field.parentElement, [
              "form-group",
              "has-error",
            ]);
            isValid = false;
          } else {
            this.replaceClasses(field.parentElement, [
              "form-group",
              "has-warning",
            ]);
          }
          // Se o campo não estiver em branco adiciona a classe de estilização "has-success".
        } else {
          this.replaceClasses(field.parentElement, [
            "form-group",
            "has-success",
          ]);
        }
      }
    });

    // Atribui os dados do formulário no objeto user.
    [...formEl].forEach((field) => {
      if (field.name == "admin") {
        user[field.name] = field.checked;
      } else if (field.name == "gender") {
        /* Verifica se o campo gender foi selecionado para adicionar a classe de
        estilização. */
        if (field.checked) {
          isGenderSelected = true;
          user[field.name] = field.value;
        }
      } else {
        user[field.name] = field.value;
      }
    });

    // Cria o atributo gender para caso não tenha sido marcada nenhuma opção.
    if (!user["gender"]) {
      user["gender"] = "";
    }

    // Obtém o elemento onde será feito a estilização do campo gender.
    const genderFormGroup = [...formEl].filter((field) => {
      return field.name == "gender";
    })[0].parentElement.parentElement.parentElement;

    // Aplica as classes de estilo do campo gender.
    if (isGenderSelected) {
      this.replaceClasses(genderFormGroup, ["form-group", "has-success"]);
    } else {
      this.replaceClasses(genderFormGroup, ["form-group", "has-warning"]);
    }

    // Retorna false se o formulário for inválido.
    if (!isValid) return false;

    // Retorna uma nova instância do objeto User passando como parâmetro os dados do formulário.
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

  getPhoto(formEl) {
    // Retorna uma promessa com a leitura da imagem do usuário.
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      // Obtém o fake path que será usado para leitura da imagem pela API.
      const file = [...formEl].filter((item) => item.name == "photo")[0]
        .files[0];

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (event) => {
        reject(event);
      };

      /* Se houver arquivo selecionado, faz a leitura. Se não houver, retorna
      imagem padrão. */
      if (file) {
        fileReader.readAsDataURL(file);
      } else {
        resolve("imgs/defaultuser.jpg");
      }
    });
  }

  replaceClasses(element, classes) {
    element.classList.value = ""; // Limpa as classes do elemento.

    // Adiciona as classes do parâmetro da função.
    classes.forEach((c) => {
      element.classList.add(c);
    });
  }

  addLine(user) {
    let tr = document.createElement("tr"); // Cria um elemento tr.

    // Adiciona as informações do usuário no dataset.
    tr.dataset.user = JSON.stringify(user);

    tr.innerHTML = `
      <td>
        <img src="${user.photo}" alt="User Image" class="img-circle img-sm">
      </td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.admin ? "Sim" : "Não"}</td>
      <td>${Utils.formatDate(user.register)}</td>
      <td>
        <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
        <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
      </td>
    `;

    this.addEventsTr(tr); // Adiciona os eventos na tr criada.

    this.tableEl.appendChild(tr); // Adiciona a tr na tabela.

    this.updateCount(); // Atualiza a contagem de usuários e admins cadastrados.
  }

  editLine(tr, user) {
    tr.dataset.user = JSON.stringify(user); // Atualiza o dataset da tr.

    tr.innerHTML = `
      <td>
        <img src="${user._photo}" alt="User Image" class="img-circle img-sm">
      </td>
      <td>${user._name}</td>
      <td>${user._email}</td>
      <td>${user._admin ? "Sim" : "Não"}</td>
      <td>${Utils.formatDate(user._register)}</td>
      <td>
        <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
        <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
      </td>
    `;

    this.addEventsTr(tr); // Adiciona os eventos na tr editada.

    this.updateCount(); // Atualiza a contagem de usuários e admins cadastrados.
  }

  getUsersFromLocalStorage() {
    let users = [];

    if (localStorage.getItem("users")) {
      users = JSON.parse(localStorage.getItem("users"));
    }

    return users;
  }

  insertInLocalStorage(data) {
    // Obtém os usuários armazenados no local storage.
    let users = this.getUsersFromLocalStorage();
    
    // Adiciona um novo usuário no array.
    users.push(data);

    // Atualiza o local storage.
    localStorage.setItem("users", JSON.stringify(users));
  }

  insertUsersInTable() {
    // Obtém os usuários armazenados no local storage.
    let users = this.getUsersFromLocalStorage();

    users.forEach(userJSON => {
      let user = new User();

      user.loadFromJSON(userJSON);

      this.addLine(user);
    })
  }

  addEventsTr(tr) {
    // Adiciona o evento de clique no botão editar.
    tr.querySelector(".btn-edit").addEventListener("click", () => {
      let json = JSON.parse(tr.dataset.user); // Obtém os dados do dataset da tr.

      // Adiciona o índice da tr no dataset do formulário de edição.
      this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

      // Adiciona no formulário de edição os dados do cadastro selecionado.
      for (let attr in json) {
        /* Seleciona o campo do formulário de acordo com o nome do atributo do
        objeto. */
        let field = this.formUpdateEl.querySelector(
          "[name=" + attr.replace("_", "") + "]"
        );

        if (field) {
          switch (field.type) {
            case "file":
              continue;
            case "radio":
              if (json[attr]) {
                field = this.formUpdateEl.querySelector(
                  "[name=" +
                    attr.replace("_", "") +
                    "][value=" +
                    json[attr] +
                    "]"
                );
                field.checked = true;
              }
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

      // Adiciona o caminho do arquivo no campo photo.
      this.formUpdateEl.querySelector("#form-user-update .photo").src =
        json._photo;

      // Exibe o box do formulário de edição.
      this.showBox("update");
    });

    // Adiciona o evento de clique no botão excluir.
    tr.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm("Deseja realmente excluir?")) {
        tr.remove(); // Remove a tr da tabela.

        // Atualiza a contagem de usuários e admins cadastrados.
        this.updateCount();
      }
    });
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

    // Percorre todas as linhas da tabela para atualizar as contagens.
    [...this.tableEl.children].forEach((tr) => {
      usersCount++;

      let user = JSON.parse(tr.dataset.user); // Obtém os dados do dataset da tr.

      // Verifica se é admin e atualiza a contagem.
      if (user._admin) adminsCount++;
    });

    // Atualiza as contagens.
    document.querySelector("#users-count").innerHTML = usersCount;
    document.querySelector("#admins-count").innerHTML = adminsCount;
  }
}
