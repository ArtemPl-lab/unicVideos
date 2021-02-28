window.onload = () => {
    const from = document.getElementById('form');
    const formData = new FormData();
    const onArchiveLoad = (file1) => {
        formData.append('videos[]', file1);
    }
    createDropZone('drop-zone1', onArchiveLoad);
    InitializeDropdowns();
    from.onsubmit = (e) => {
        e.preventDefault();
        let store = {};
        let checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            store[`${checkbox.name}`] = checkbox.checked;
        });
        let textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach(inp => {
            store[`${inp.name}`] = inp.value;
        });
        let numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(inp => {
            store[`${inp.name}`] = parseInt(inp.value);
        });
        let textAreas = document.querySelectorAll('textarea');
        textAreas.forEach(textarea => {
            store[`${textarea.name}`] = textarea.value;
        });
        let radios = document.querySelectorAll('input[type="radio"]:checked');
        radios.forEach(radio=>{
            store[`${radio.name}`] = radio.value;
        });
        formData.set('params', JSON.stringify(store));
        // alert("В ближайшее время начнётся загрузка");
        sendData(formData);
    }

    const sendData = async (data) => {
        document.getElementById('drop-zone1').style.backgroundImage = 'none';
        document.getElementById('content1').style.display = 'none';
        document.getElementById('content2').style.display = 'block';
        const response = await fetch('https://slpv.foxcpp.dev/videos', {
            method: 'POST', 
            body: data
        });
        const { session_id  } = await response.json();
        const websocket = new WebSocket(`wss://slpv.foxcpp.dev/videos_status?session_id=${session_id}`);
        websocket.onmessage = (e) => {
            const resp = JSON.parse(e.data);
            const perc = resp.completed * 100.00 / resp.total;
            setPersent(perc);
            if(resp.ok && resp.filename){
                loadFile(resp.filename, session_id)
            }
        }
    }
    const  setPersent = (percent) => {
        const loader = document.getElementById('loader');
        loader.style.setProperty('--load', `${percent}%`);
        loader.innerHTML = `<div>${percent}%</div>`;
    }
    const loadFile = async (filename, session_id) => {
        const res = await fetch(`https://slpv.foxcpp.dev/videos_output/${session_id}/${filename}`);
        if(res.ok){
            const blob = await res.blob();
            let url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();    
            a.remove();     
        }
        else if(res.status !== 404){
            alert("Fatal error");
        }
    }
}