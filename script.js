const url = 'http://localhost:8000';
const headers = {
  'Content-Type': 'application/json;charset=utf-8'
}

let expenses = [];

window.onload = () => {
  try {
    if (document.querySelector('.costapp-btn') === null) {
      throw new Error;
    }
  } catch (err) {
    getError(err);
    throw err
  }
  getAllData();
}

const getAllData = async () => {
  try {
    const resp = await fetch(`${url}/expenses`, {
      method: 'GET'
    });
    const result = await resp.json();
    expenses = result.data;
    render();
  } catch (err) {
    getError(err);
    throw err;
  }
}

const getError = (error) => {
  const showError = document.querySelector('.error');
  showError.innerHTML = error;
  showError.style.display = 'block'
  setTimeout(() => showError.style.display = 'none', 2000);
}

const render = () => {
  const expensesCopy = [...expenses];
  if (document.querySelector('.render-items') === null) {
    return;
  }
  const costappExpenses = document.querySelector('.render-items');
  while (costappExpenses.firstChild) {
    costappExpenses.removeChild(costappExpenses.firstChild)
  }
  const priceSum = calcTotalPrice(expensesCopy);
  const totalPrice = document.createElement('div');
  totalPrice.classList.add('render_total');
  totalPrice.innerHTML = `Итого: ${priceSum} p.`;
  costappExpenses.appendChild(totalPrice)

  expensesCopy.forEach((elem, index) => {
    const {_id, text, price, date} = elem;
    const expense = document.createElement('div');
    expense.id = `expense-${_id}`;
    expense.classList.add('render-item');
    const expenseText = document.createElement('div');
    const expensePrice = document.createElement('div');
    const expenseDate = document.createElement('div');
    expenseText.innerText = `${index + 1}) ${text}`;
    expensePrice.innerText = `${price} p.`;
    expenseDate.innerText = date;

    expense.appendChild(expenseText);
    expense.appendChild(expenseDate);
    expense.appendChild(expensePrice);

    const editButton = document.createElement('button');
    const editIcon = document.createElement('img');
    editIcon.src = 'icons/edit_icon.png';
    editButton.appendChild(editIcon);
    editButton.classList.add('edit-btn');

    const deleteButton = document.createElement('button');
    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'icons/trash_icon.png';
    deleteButton.appendChild(deleteIcon);
    deleteButton.classList.add('delete-button');

    editButton.onclick = () => {
      creatEditInput(_id, text, price);
    }

    deleteButton.onclick = () => {
      deleteExpense(_id);
    }

    expense.appendChild(editButton);
    expense.appendChild(deleteButton);

    costappExpenses.appendChild(expense)
  })
}

const creatEditInput = (_id, text, price) => {
  const task = document.getElementById(`expense-${_id}`);
  if (!task.classList.contains('edit')) {
    task.classList.add('edit');
    const editText = document.createElement("input");
    editText.type = "text";
    editText.value = text;
    const editPrice = document.createElement("input");
    editPrice.type = "number";
    editPrice.value = price;

    editText.onchange = () => {
      editExpense(_id, editText.value, +price);
    }

    editPrice.onchange = () => {
      editExpense(_id, editPrice.value, text);
    }
    task.appendChild(editText);
    task.appendChild(editPrice);
  } else {
    task.classList.remove('edit');
    task.removeChild(task.lastChild.previousElementSibling);
    task.removeChild(task.lastChild);
  }
}

const addExpense = async () => {
  try {
    const input = document.querySelector('.input_where_wrap .costapp__input');
    const input2 = document.querySelector('.input_howmuch_wrap .costapp__input');

    let inputText = input.value;
    let inputPrice = input2.value;

    if (inputText.trim() === '' || inputPrice.trim() === '') {
      input.value = '';
      input2.value = '';
      return;
    }
    const resp = await fetch(`${url}/new`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: inputText,
        price: inputPrice
      })
    });
    const result = await resp.json();
    expenses.push(result);
    input.value = '';
    input2.value = '';
    render();
  } catch (err) {
    getError(err);
    throw err;
  }
}

const editExpense = async (id, text, price) => {
  try {
    if (typeof price === 'number') {
      const resp = await fetch(`${url}/update/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          text,
          price,
          _id: id
        })
      });
      expenses.forEach(element => {
        if (element._id === id) {
          element.text = text;
        }
      })
    } else {
      const resp = await fetch(`${url}/update/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          text: price,
          price: text,
          _id: id
        })
      });
      expenses.forEach(element => {
        if (element._id === id) {
          element.price = +text;
        }
      })
    }
    render();
  } catch (err) {
    getError(err);
    throw err;
  }
}

const deleteExpense = async (id) => {
  try {
    const resp = await fetch(`${url}/delete/${id}`, {
      method: 'DELETE'
    });
    const result = await resp.json();
    if (result.deletedCount === 1) {
      expenses = expenses.filter((elem) => elem._id !== id)
    }
    render();
  } catch (err) {
    getError(err);
    throw err;
  }
}

const calcTotalPrice = (arr) => {
  let out = 0;
  arr.forEach(element => {
    out += element.price;
  });
  return out;
}
