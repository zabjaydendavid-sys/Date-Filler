document.getElementById("process").addEventListener("click", () => {
    const input = document.getElementById("input").value;

    if (!input.trim()) {
        alert("Please paste your data first.");
        return;
    }

    document.getElementById("output").value =
        "Your parser will go here!\n\n" + input;
});
