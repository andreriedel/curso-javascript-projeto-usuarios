const addLine = (user) => {

  let tr = document.createElement("tr");

  tr.innerHTML = `
    <td><img src="dist/img/user1-128x128.jpg" alt="User Image" class="img-circle img-sm"></td>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.admin}</td>
    <td>${user.birth}</td>
    <td>
      <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
      <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
    </td>
  `;

  document.querySelector("#table-users").appendChild(tr);
}

document.querySelector("#form-user-create").addEventListener("submit", (event) => {
  event.preventDefault();
  
  let user = {};
  let fields = document.querySelectorAll("#form-user-create [name]");

  fields.forEach((field) => {
    if (field.name == "gender") {
      if (field.checked) {
        user[field.name] = field.value;
      }
    } else {
      user[field.name] = field.value;
    }
  });

  addLine(user);
});
