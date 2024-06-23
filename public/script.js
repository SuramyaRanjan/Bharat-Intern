let expenses = [];
let totalAmount = 0;

const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const infoInput = document.getElementById('info');
const dateInput = document.getElementById('date_input');
const addButton = document.getElementById('add_btn');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountDisplay = document.getElementById('total-amount');

// Fetch data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadExpenses();
});

function loadExpenses() {
    // Load data from local storage
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
        expenses.forEach(expense => addExpenseToTable(expense));
        updateTotalAmount();
    } else {
        // If no data in local storage, fetch from server
        fetch('/expenses')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                expenses = data;
                expenses.forEach(expense => addExpenseToTable(expense));
                updateTotalAmount();
                // Save to local storage
                localStorage.setItem('expenses', JSON.stringify(expenses));
            })
            .catch(error => console.error('Error fetching data:', error));
    }
}

addButton.addEventListener('click', function(event) {
    event.preventDefault();

    const category = categorySelect.value;
    const amount = parseFloat(amountInput.value); // Ensure amount is a number
    const info = infoInput.value;
    const date = dateInput.value;

    if (!category || isNaN(amount) || !info || !date) {
        alert("Please fill out all fields correctly");
        return;
    }

    const expense = { category_select: category, amount_input: amount, info: info, date_input: date };

    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(expense)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.message === "Record Inserted Successfully") {
            expenses.push(expense);
            addExpenseToTable(expense);
            updateTotalAmount();
            clearForm();
            // Save to local storage
            saveData();
        } else {
            alert("Error adding record");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});

function addExpenseToTable(expense) {
    // Ensure amount_input is a valid number
    if (typeof expense.amount_input !== 'number' || isNaN(expense.amount_input)) {
        console.error('Invalid amount_input:', expense.amount_input);
        return;
    }

    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${expense.category_select}</td>
        <td>${expense.amount_input.toFixed(2)}</td>
        <td>${expense.info}</td>
        <td>${expense.date_input}</td>
        <td><button class="delete-btn">Delete</button></td>
    `;

    const deleteButton = row.querySelector('.delete-btn');
    deleteButton.addEventListener('click', function() {
        row.remove();
        expenses = expenses.filter(e => e !== expense);
        updateTotalAmount();
        // Save to local storage
        saveData();
        // Add code to delete from database here
    });

    expenseTableBody.appendChild(row);
}

function updateTotalAmount() {
    totalAmount = expenses.reduce((sum, expense) => {
        // Ensure expense.amount_input is a valid number before adding to sum
        const amount = parseFloat(expense.amount_input);
        if (!isNaN(amount)) {
            return sum + (expense.category_select === 'Income' ? amount : -amount);
        } else {
            console.error('Invalid amount_input:', expense.amount_input);
            return sum; // Ignore this expense in total calculation
        }
    }, 0);
    totalAmountDisplay.textContent = totalAmount.toFixed(2);
}


function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function clearForm() {
    categorySelect.value = 'Expense';
    amountInput.value = '';
    infoInput.value = '';
    dateInput.value = '';
}
