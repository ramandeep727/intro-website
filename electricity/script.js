function generateBill() {
    let name = document.getElementById("name").value;
    let units = parseFloat(document.getElementById("units").value);

    let r1 = parseFloat(document.getElementById("rate1").value);
    let r2 = parseFloat(document.getElementById("rate2").value);
    let r3 = parseFloat(document.getElementById("rate3").value);

    let fixed = parseFloat(document.getElementById("fixed").value) || 0;
    let gst = parseFloat(document.getElementById("gst").value) || 0;

    let energyCharge = 0;

    if (units <= 100) {
        energyCharge = units * r1;
    } else if (units <= 300) {
        energyCharge = (100 * r1) + (units - 100) * r2;
    } else {
        energyCharge = (100 * r1) + (200 * r2) + (units - 300) * r3;
    }

    let subtotal = energyCharge + fixed;
    let gstAmount = (subtotal * gst) / 100;
    let total = subtotal + gstAmount;

    let billHTML = `
<div class="invoice">

    <div class="header">
        <h2>Punjab State Power Corporation Limited</h2>
        <p>Electricity Bill</p>
    </div>

    <div class="info">
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Units Consumed:</strong> ${units}</p>
    </div>

    <table>
        <tr>
            <th>Description</th>
            <th>Amount (₹)</th>
        </tr>
        <tr>
            <td>Energy Charges</td>
            <td>${energyCharge.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Fixed Charges</td>
            <td>${fixed.toFixed(2)}</td>
        </tr>
        <tr>
            <td>GST (${gst}%)</td>
            <td>${gstAmount.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
            <td>Total Amount</td>
            <td>₹${total.toFixed(2)}</td>
        </tr>
    </table>

    <div class="footer">
        <p>Thank you for using our service ⚡</p>
    </div>

</div>
`;

    document.getElementById("bill").innerHTML = billHTML;

    // Save to localStorage
    let billData = {
        name,
        units,
        total: total.toFixed(2),
        date: new Date().toLocaleString()
    };

    let history = JSON.parse(localStorage.getItem("bills")) || [];
    history.push(billData);
    localStorage.setItem("bills", JSON.stringify(history));
}
function printBill() {
    let content = document.getElementById("bill").innerHTML;
    let win = window.open("", "", "width=800,height=600");
    
    win.document.write("<html><head><title>Print Bill</title></head><body>");
    win.document.write(content);
    win.document.write("</body></html>");
    
    win.document.close();
    win.print();
}

function downloadPDF() {
    let element = document.getElementById("bill");

    let opt = {
        margin: 0.5,
        filename: 'Electricity_Bill.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}