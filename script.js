function handleImageUpload(input, id) {
    const preview = document.getElementById(id);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.setAttribute('data-image-src', e.target.result);
        }
        reader.readAsDataURL(file);
    }
}

async function exportToWord() {
    try {
        const locationInput = document.querySelector('.location-input');
        const locationValue = locationInput ? locationInput.value : "Not Specified";
        
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
                <meta charset="utf-8">
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                    </w:WordDocument>
                </xml>
                <style>
                    @page Section1 {
                        margin: 1.0in;
                        mso-page-orientation: portrait;
                        size: 21.0cm 29.7cm;
                    }
                    div.Section1 { page:Section1; }
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0;
                        padding: 0;
                    }
                    table { 
                        border-collapse: collapse; 
                        width: 100%;
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid black; 
                        padding: 8px;
                        vertical-align: top;
                    }
                    img { 
                        width: 3in;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <div class="Section1">
                    <h1 style="text-align:center">CBA Template</h1>
                    <p><strong>Location:</strong> ${locationValue}</p>
                    <table>
                        <tr>
                            <th style="width:20%">Functional Area</th>
                            <th style="width:40%">Photograph Before</th>
                            <th style="width:40%">Observation</th>
                        </tr>`;

        const rows = document.querySelectorAll('tbody tr');
        for (const row of rows) {
            const area = row.querySelector('.functional-area').textContent;
            const img = row.querySelector('.image-preview');
            const obs = row.querySelector('textarea').value || '';
            
            let imgHtml = '';
            if (img && img.src && !img.src.includes('undefined')) {
                imgHtml = `<img src="${img.src}" style="width:3in">`;
            }

            htmlContent += `
                <tr>
                    <td style="width:20%">${area}</td>
                    <td style="width:40%">${imgHtml}</td>
                    <td style="width:40%">${obs.replace(/\n/g, '<br>')}</td>
                </tr>`;
        }

        htmlContent += `
                    </table>
                </div>
            </body>
            </html>`;

        const blob = new Blob(['\ufeff', htmlContent], { 
            type: 'application/msword;charset=utf-8' 
        });
        
        const fileName = `CBA_Template_${locationValue}_${new Date().toISOString().split('T')[0]}.doc`;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Please try again.');
    }
}