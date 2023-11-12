function convertDateToReadableFormat(inputDate) {
    const dateParts = inputDate.match(/(\d{4})-(\d{2})-(\d{2})/);
  
    if (dateParts) {
      const year = dateParts[1];
      const month = dateParts[2];
      const day = dateParts[3];
  
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
  
      const monthName = months[parseInt(month, 10) - 1];
  
      return `${monthName} ${parseInt(day, 10)}, ${year}`;
    }
  }

// Function to sort lifts by date
function sortLiftsByDate(userLifts) {
    return userLifts.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Function to add data to the table
function addDataToTable(userLifts) {
    if (userLifts.length > 0) {
        userLifts.forEach((row) => {
            row.lifts.total = row.lifts.squat + row.lifts.bench + row.lifts.deadlift;

            $("#profile").append(
                "<tr>" +
                "<td>" + convertDateToReadableFormat(row.date) + "</td>" +
                "<td>" + row.lifts.squat + "</td>" +
                "<td>" + row.lifts.bench + "</td>" +
                "<td>" + row.lifts.deadlift + "</td>" +
                "<td>" + row.lifts.total + "</td>" +
                "</tr>"
            );
        });
    }
}

function signOut() {
    localStorage.removeItem('user');
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = 'index.html'));
}

document.addEventListener('DOMContentLoaded', function() {

    // Gets user from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    // Checks if user is logged in
    if (!user) window.location.href = "index.html";
    
    // Displays username
    document.querySelector('#username').innerHTML = username;

    // Logout
    const logout = document.querySelector('#logout');
    logout.addEventListener('click', function(e) {
        e.preventDefault();
        
        signOut();
    });
  
    
    fetch('/api/lifts')
    
    .then((response) => response.json())
    .then((data) => {

    // Filter data by user
    const userData = data.filter((row) => row.user === username);
    
    let userLifts = []

    if (userData.length > 0) {
        userLifts = sortLiftsByDate(userData[0].lifts);
    }
    console.log(userLifts)

    // Add data to table
    addDataToTable(userLifts);

    // Add DataTables
    $(document).ready(function () {
        $("#profile").DataTable({
        autoWidth: true,
        scrollY: true,
        scrollX: true,
        dom: "<lf<t>Bip>",
        lengthMenu: [
            [10, 20, 25, 50, -1],
            [10, 20, 25, 50, "All"],
        ],
        columnDefs: [
            { width: "175px", targets: 0 },
            { width: "70px", targets: 1 },
            { width: "70px", targets: 2 },
            { width: "70px", targets: 3 },
            { width: "70px", targets: 4 },
        ],
        order: [[0, "asc"]],
        buttons: [
            "csv",
            {
            extend: "pdfHtml5",
            orientation: "landscape",
            pageSize: "LEGAL",
            },
        ],
        });
    });

    const dates = [];
    const squatValues = [];
    const benchValues = [];
    const deadliftValues = [];
    
    if (userLifts.length > 0) {

      const lifts = userLifts;
      dates.push(...lifts.map((entry) => convertDateToReadableFormat(entry.date)));
      squatValues.push(...lifts.map((entry) => entry.lifts.squat));
      benchValues.push(...lifts.map((entry) => entry.lifts.bench));
      deadliftValues.push(...lifts.map((entry) => entry.lifts.deadlift));
    }
   
    const ctx = document
        .getElementById("progressGraph")
        .getContext("2d");

    // Create graph
    new Chart(ctx, {
        type: "line",
        data: {
        labels: dates,
        datasets: [
            {
            label: "Squat",
            data: squatValues,
            borderColor: "#d4c2be",
            backgroundColor: "#d4c2be",
            borderWidth: 6,
            fill: false,
            },
            {
            label: "Bench",
            data: benchValues,
            borderColor: "#91736e",
            backgroundColor: "#91736e",
            borderWidth: 6,
            fill: false,
            },
            {
            label: "Deadlift",
            data: deadliftValues,
            borderColor: "#755651",
            backgroundColor: "#755651",
            borderWidth: 6,
            fill: false,
            },
        ],
        },
        options: {
        plugins: {
            tooltip: {
            displayColors: false,
            backgroundColor: "#2b3035",
            titleColor: "#B5B5B0",
            titelAlign: "center",
            titleFont: {
                size: 18,
                weight: "bold",
                family: "Inter, sans-serif",
            },
            bodyColor: "#B5B5B0",
            bodyAlign: "center",
            bodyFont: {
                size: 18,
                family: "Inter, sans-serif",
            },
            },
            legend: {
            position: "top",
            onClick: (click, legendItem, legend) => {
                const datasets = legend.legendItems.map(
                (dataset, index) => {
                    return dataset.text;
                }
                );
                const index = datasets.indexOf(legendItem.text);
                if (legend.chart.isDatasetVisible(index) === true) {
                legend.chart.hide(index);
                } else {
                legend.chart.show(index);
                }
            },
            labels: {
                generateLabels: (chart) => {
                let visibility = [];
                for (let i = 0; i < chart.data.datasets.length; i++) {
                    if (chart.isDatasetVisible(i) === true) {
                    visibility.push("#B5B5B0");
                    } else {
                    visibility.push("#636360");
                    }
                }
                return chart.data.datasets.map((dataset, index) => ({
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor,
                    strokeStyle: dataset.borderColor,
                    fontColor: visibility[index],
                }));
                },
                padding: 20,
                boxWidth: 30,
                font: {
                weight: "bold",
                size: 20,
                family: "Inter, sans-serif",
                },
            },
            },
        },
        scales: {
            x: {
            ticks: {
                color: "#B5B5B0",
                font: {
                // weight: "bold",
                size: 18,
                family: "Inter, sans-serif",
                },
            },
            grid: {
                display: false,
            },
            },
            y: {
            beginAtZero: true,
            ticks: {
                color: "#B5B5B0",
                font: {
                // weight: "bold",
                size: 18,
                family: "Inter, sans-serif",
                },
            },
            grid: {
                display: false,
            },
            },
        },
        },
    });
    });
});