// Image upload handler with explicit data storage
function handleImageUpload(input, id) {
    const preview = document.getElementById(id);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.setAttribute('data-image-data', e.target.result); // Store image data as attribute
        }
        reader.readAsDataURL(file);
    }
}

// Modified compression function with error handling
async function compressImage(base64String) {
    try {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set dimensions
                let width = 800;  // Max width
                let height = 600; // Max height
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed data
                const compressedData = canvas.toDataURL('image/jpeg', 0.5);
                resolve(compressedData);
            };
            img.onerror = function() {
                resolve(''); // Return empty string if image fails to load
            };
            img.src = base64String;
        });
    } catch (error) {
        console.error('Image compression error:', error);
        return ''; // Return empty string on error
    }
}

// Modified export function with better error handling
async function exportToWord() {
    try {
        const locationValue = document.getElementById('location-input').value || "Location Not Specified";
        
        // Start of document
        let content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word'
                  xmlns:m='http://schemas.microsoft.com/office/2004/12/omml'>
            <head>
                <meta charset="utf-8">
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 1cm;
                        mso-page-orientation: portrait;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 1cm;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 1cm;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 0.5cm;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 0.3cm;
                        vertical-align: top;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    .location {
                        margin-bottom: 1cm;
                    }
                </style>
            </head>
            <body>
                <h1>CBA Template</h1>
                <div class="location">
                    <strong>Location:</strong> ${locationValue}
                </div>
                <table>
                    <tr>
                        <th>Functional Area</th>
                        <th>Photograph Before</th>
                        <th>Observation</th>
                    </tr>
        `;

        // Process each row
        const rows = document.querySelectorAll('tbody tr');
        for (const row of rows) {
            const areaName = row.querySelector('.functional-area').textContent;
            const imgElement = row.querySelector('.image-preview');
            const observation = row.querySelector('textarea')?.value || '';
            
            let imageHtml = '';
            if (imgElement && imgElement.getAttribute('data-image-data')) {
                const compressedImage = await compressImage(imgElement.getAttribute('data-image-data'));
                if (compressedImage) {
                    imageHtml = `<img src="${compressedImage}" style="width:400px;height:300px">`;
                }
            }

            content += `
                <tr>
                    <td>${areaName}</td>
                    <td>${imageHtml}</td>
                    <td>${observation.replace(/\n/g, '<br>')}</td>
                </tr>
            `;
        }

        // Close the document
        content += `
                </table>
            </body>
            </html>
        `;

        // Create and download file
        const blob = new Blob([content], { type: 'application/msword' });
        const fileName = `CBA_Template_${locationValue}_${new Date().toISOString().split('T')[0]}.doc`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(link.href), 100);

    } catch (error) {
        console.error('Export error:', error);
        alert('Error creating document. Please check the console for details.');
    }
}