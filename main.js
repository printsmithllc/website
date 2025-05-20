// Use environment variable for backend URL or fallback to local development
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

document.getElementById('submitBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('stlFile');
    const file = fileInput.files[0];
    if (file && file.name.endsWith('.stl')) {
        const formData = new FormData();
        formData.append('stlFile', file);
        
        // Show loading state
        document.getElementById('result').innerHTML = '<p>Loading...</p>';
        document.getElementById('submitBtn').disabled = true;

        // Send file to backend
        fetch(`${BACKEND_URL}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('result').innerHTML = `<p class="text-red-500">${data.error}</p>`;
            } else {
                document.getElementById('result').innerHTML = `
                    <p>File: ${file.name}</p>
                    <p>Estimated Material Volume: ${data.volume.toFixed(2)} cubic mm</p>
                    <p>Estimated Cost: $${data.cost.toFixed(2)}</p>
                `;
                // Render STL in viewer
                renderSTL(file);
            }
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        })
        .finally(() => {
            document.getElementById('submitBtn').disabled = false;
        });
    } else {
        document.getElementById('result').innerHTML = '<p class="text-red-500">Please select a valid STL file.</p>';
    }
});