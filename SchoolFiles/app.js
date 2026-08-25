const SUPABASE_URL = "https://vtqbjvxkbbtprduxsrho.supabase.co";
const SUPABASE_KEY = "sb_publishable_eqe-Ex3r6zVzXLH19hOLxw_8yvxoeiP";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const uploadMessage = document.getElementById("uploadMessage");

loginBtn.addEventListener("click", async function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    message.textContent = "Logging in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        message.textContent = "Login failed: " + error.message;
        return;
    }

    message.textContent = "Login successful! 🎉";
    checkLogin();
});

uploadBtn.addEventListener("click", async function () {
    const file = fileInput.files[0];

    if (!file) {
        uploadMessage.textContent = "Please choose a file first.";
        return;
    }

    uploadMessage.textContent = "Uploading...";

    const filePath = Date.now() + "_" + file.name;

    const { error } = await supabaseClient.storage
        .from("srideepschool-files")
        .upload(filePath, file);

    if (error) {
        uploadMessage.textContent = "Upload failed: " + error.message;
        return;
    }

    uploadMessage.textContent = "File uploaded successfully! 🎉";
    fileInput.value = "";
});

async function loadFiles() {
    const fileList = document.getElementById("fileList");

    fileList.innerHTML = "Loading files...";

    const { data, error } = await supabaseClient.storage
        .from("srideepschool-files")
        .list("", {
            sortBy: {
                column: "name",
                order: "desc"
            }
        });

    if (error) {
        fileList.innerHTML = "Failed to load files: " + error.message;
        return;
    }

    if (!data || data.length === 0) {
        fileList.innerHTML = "No files uploaded yet.";
        return;
    }

    fileList.innerHTML = "";

   data.forEach(function (file) {
    const fileItem = document.createElement("div");

    const fileName = document.createElement("span");
    fileName.textContent = file.name + " ";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";

    downloadBtn.addEventListener("click", async function () {
        const { data: downloadData, error: downloadError } =
            await supabaseClient.storage
                .from("srideepschool-files")
                .download(file.name);

        if (downloadError) {
            alert("Download failed: " + downloadError.message);
            return;
        }

        const url = URL.createObjectURL(downloadData);
        const link = document.createElement("a");

        link.href = url;
        link.download = file.name;
        link.click();

        URL.revokeObjectURL(url);
    });

    fileItem.appendChild(fileName);
fileItem.appendChild(downloadBtn);

const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";

deleteBtn.addEventListener("click", async function () {
    const confirmDelete = confirm(
        "Are you sure you want to delete " + file.name + "?"
    );

    if (!confirmDelete) {
        return;
    }

    const { error: deleteError } = await supabaseClient.storage
        .from("srideepschool-files")
        .remove([file.name]);

    if (deleteError) {
        alert("Delete failed: " + deleteError.message);
        return;
    }

    alert("File deleted successfully!");

    loadFiles();
});

fileItem.appendChild(deleteBtn);
fileList.appendChild(fileItem);
});
}

const refreshBtn = document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", function () {
    loadFiles();
});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Logout failed: " + error.message);
        return;
    }

    window.location.reload();
});

async function checkLogin() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    const schoolFilesSection =
        document.getElementById("schoolFilesSection");

    const loginBox =
        document.querySelector(".login-box");

    if (session) {
        schoolFilesSection.style.display = "block";
        loginBox.style.display = "none";
    } else {
        schoolFilesSection.style.display = "none";
        loginBox.style.display = "block";
    }
}

checkLogin();