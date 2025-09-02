class User {
  constructor(name, gender, birth, country, email, password, photo, admin) {
    this._id;
    this._name = name;
    this._gender = gender;
    this._birth = birth;
    this._country = country;
    this._email = email;
    this._password = password;
    this._photo = photo;
    this._admin = admin;
    this._register = new Date();
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get gender() {
    return this._gender;
  }

  get birth() {
    return this._birth;
  }

  get country() {
    return this._country;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get photo() {
    return this._photo;
  }

  get admin() {
    return this._admin;
  }

  get register() {
    return this._register;
  }

  /* ------------------------------------------------------------------------ */

  set id(value) {
    this._id = value;
  }

  set name(value) {
    this._name = value;
  }

  set gender(value) {
    this._gender = value;
  }

  set birth(value) {
    this._birth = value;
  }

  set country(value) {
    this._country = value;
  }

  set email(value) {
    this._email = value;
  }

  set password(value) {
    this._password = value;
  }

  set photo(value) {
    this._photo = value;
  }

  set admin(value) {
    this._admin = value;
  }

  set register(value) {
    this._register = value;
  }

  /* ------------------------------------------------------------------------ */

  loadFromJSON(json) {
    for (let attr in json) {
      if (attr == "_register") {
        this[attr] = new Date(json[attr]);
      } else {
        this[attr] = json[attr]; // Atribui ao objeto os dados obtidos do json.
      }
    }
  }

  static getUsersFromLocalStorage() {
    let users = []; // Array com todos os usuários cadastrados no local storage.

    if (localStorage.getItem("users")) {
      users = JSON.parse(localStorage.getItem("users")); // Converte de JSON para array.
    }

    return users;
  }

  getNewID() {
    let usersId = parseInt(localStorage.getItem("usersId"));

    if (!usersId > 0) {
      usersId = 0;
    }

    usersId++;

    // Adiciona um novo id de usuário ao local storage.
    localStorage.setItem("usersId", usersId);

    return usersId;
  }

  save() {
    // Obtém os usuários armazenados no local storage.
    let users = User.getUsersFromLocalStorage();

    if (this.id > 0) {
      users.map((user) => {
        if (user._id == this.id) {
          Object.assign(user, this);
        }

        return user;
      });
    } else {
      this.id = this.getNewID();

      // Adiciona um novo usuário no array.
      users.push(this);
    }

    // Atualiza o local storage.
    localStorage.setItem("users", JSON.stringify(users));
  }

  remove() {
    // Obtém os usuários armazenados no local storage.
    let users = User.getUsersFromLocalStorage();

    // Remove o usuário do local storage.
    users.forEach((user,  idx) => {
      if (this._id == user._id) {
        users.splice(idx, 1);
      }
    });

    // Atualiza o local storage.
    localStorage.setItem("users", JSON.stringify(users));
  }
}
