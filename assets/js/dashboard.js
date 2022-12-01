const ctx = document.getElementById('chart-1');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Credit score over the past 12 Months',
        data: [12, 19, 3, 5, 2, 3,9,5,3,7,3,9],
        borderWidth: 1,
        backgroundColor: '#08ED20',
        borderColor:'#08ED20'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });


  const ctx2 = document.getElementById('chart-2');

  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Area Avg Credit Score for past 12 Months',
        data: [12, 19, 3, 5, 2, 3,9,5,3,7,3,9],
        borderWidth: 1,
        backgroundColor: '#08ED20'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });