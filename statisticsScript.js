// 導航欄開闔
function toggleNav() {
    const nav = document.getElementById('sidebar');
    nav.classList.toggle('collapsed');
}

const navLinks = document.querySelectorAll('nav a'); 

// 點擊導航欄選項，將選項變色，並頁面跳轉內容
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // 先把所有的連結移除 active class
        navLinks.forEach(item => {
            item.classList.remove('active');
        });

        // 為被點擊的連結添加 active class
        link.classList.add('active');
    });
});

// 從URL中獲取城池路徑
const urlParams = new URLSearchParams(window.location.search);
const path = urlParams.get('path');

// 將城池路徑解析並顯示在麵包屑中
if (path) {
    const breadcrumbs = document.getElementById('breadcrumbs');
    const cities = path.split('-');
    let breadcrumbHTML = '';
    let tempPath = '';
    cities.forEach((city, index) => {
        if (index == cities.length - 1) { // 城
            breadcrumbHTML += city;
        }
        else if (index > 0) { // 郡
            tempPath += `-${city}`;
            breadcrumbHTML += `<a href="#" onclick="navigateToIndex('${tempPath}')">${city}</a>`;
        } else { // 區
            breadcrumbHTML += `<a href="#" onclick="navigateToIndex('')">${city}</a>`;
        }
        if (index < cities.length - 1) {
            breadcrumbHTML += ' > ';
        }
        console.log(breadcrumbHTML)
    });
    breadcrumbs.innerHTML = breadcrumbHTML;
}

// 頁面導航函數，將城池路徑傳遞到上一個網頁
function navigateToIndex(path) {
    window.location.href = `index.html?path=${path}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // 添加下載按鈕功能
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', exportTableToExcel);
    // 匯出excel紀錄表
    function exportTableToExcel() {
        // 設定檔案名稱
        const groupName = document.querySelector('.table-title').innerHTML;
        const cityName = getCityName();
        // 設定檔案名稱
        let fileName = '.xlsx';
        if (groupName == '點擊設定表格標題'){
            fileName = '' + cityName + fileName;
        } else {
            fileName = '' + groupName + '-' + cityName + fileName;
        }

        // 取得表格元素
        const table = document.querySelector('.attendanceList');
        
        // 克隆表格進行操作，以免影響原表格
        const clonedTable = table.cloneNode(true);
        
        // 獲取所有表頭格
        const headerCells = clonedTable.querySelectorAll('thead th');
        
        // 尋找不需要的表頭index
        let columnIndexToDelete = -1;
        headerCells.forEach((cell, index) => {
            if (cell.innerText === '選擇') {
                columnIndexToDelete = index;
            }
        });

        // 刪除不需要的表頭
        if (columnIndexToDelete !== -1) {
            headerCells[columnIndexToDelete].remove();
        }

        // 使用SheetJS將表格轉換為工作表
        const wb = XLSX.utils.table_to_book(clonedTable);

        // 生成Excel文件並下载
        XLSX.writeFile(wb, fileName);
    }

    // 取得城池名稱
    function getCityName() {
        // 從URL中獲取城池路徑
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');
        // 分割path取得城池名稱
        const cities = path.split('-');
        return cities[2]
    }

    // 編輯攻城標準
    const troopStandardText = document.getElementById('troopStandardText');
    const troopStandardInput = document.getElementById('troopStandardInput');
    const siegeStandardText = document.getElementById('siegeStandardText');
    const siegeStandardInput = document.getElementById('siegeStandardInput');

    function switchToEditMode(displayElement, inputElement, textElement) {
        displayElement.style.display = 'none';
        inputElement.style.display = 'inline-block';
        inputElement.value = textElement.innerText;
        inputElement.focus();
    }

    function switchToDisplayMode(displayElement, inputElement, textElement) {
        displayElement.style.display = 'inline-block';
        inputElement.style.display = 'none';
        textElement.innerText = `${inputElement.value}`;
    }
    // 點擊時切換為input
    troopStandardText.addEventListener('click', () => {
        switchToEditMode(troopStandardText, troopStandardInput, troopStandardText);
    });
    siegeStandardText.addEventListener('click', () => {
        switchToEditMode(siegeStandardText, siegeStandardInput, siegeStandardText);
    });
    // 離開時恢復顯示
    troopStandardInput.addEventListener('blur', () => {
        const cityName = getCityName();
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據，若無則初始化為空對象
        switchToDisplayMode(troopStandardText, troopStandardInput, troopStandardText);
        siegeData.troopStandard = troopStandardInput.value;
        localStorage.setItem(`siegeData_${cityName}`, JSON.stringify(siegeData)); // 儲存更新後的主力標準到localStorage
        changeTbodyColor(); // 依攻城標準改變表格顏色
        saveTableData(); // 更新localStorage裡的標準
        drawAttendanceRatePieChart(); // 更新出席率圓餅圖
    });
    siegeStandardInput.addEventListener('blur', () => {
        const cityName = getCityName();
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據，若無則初始化為空對象
        switchToDisplayMode(siegeStandardText, siegeStandardInput, siegeStandardText);
        siegeData.siegeStandard = siegeStandardInput.value;
        localStorage.setItem(`siegeData_${cityName}`, JSON.stringify(siegeData)); // 儲存更新後的器械標準到localStorage
        changeTbodyColor(); // 依攻城標準改變表格顏色
        saveTableData(); // 更新localStorage裡的標準
        drawAttendanceRatePieChart(); // 更新出席率圓餅圖
    });
    // 按enter一樣恢復顯示
    troopStandardInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            troopStandardInput.blur(); // 讓輸入框失去焦點，觸發 blur 事件
        }
    });
    siegeStandardInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            siegeStandardInput.blur(); // 讓輸入框失去焦點，觸發 blur 事件
        }
    });

    // 編輯攻城時間
    const dateTimeDisplay = document.getElementById('dateTimeDisplay');
    const editModeInput = document.querySelector('.date-time input.edit-mode');
    dateTimeDisplay.addEventListener('click', () => {
        dateTimeDisplay.classList.add('editing');
        editModeInput.style.display = 'inline-block';
        editModeInput.focus();
    });
    
    // 失去焦點時退出編輯時間狀態
    editModeInput.addEventListener('blur', () => {
        const cityName = getCityName();
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據，若無則初始化為空對象
        dateTimeDisplay.classList.remove('editing');
        editModeInput.style.display = 'none'; // 將編輯模式輸入框隱藏
        // 更新時間區域的顯示文字
        const dateValue = editModeInput.value;
        const formattedDate = "攻城時間: " + dateValue.replace('T', ' ');
        dateTimeDisplay.querySelector('.display-mode').innerText = formattedDate;

        // 儲存攻城時間到localStorage
        siegeData.siegeTime = dateValue;
        localStorage.setItem(`siegeData_${cityName}`, JSON.stringify(siegeData)); // 儲存更新後的攻城時間到localStorage
    });

    // 當按下 Enter 鍵時，同樣退出編輯時間狀態
    editModeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            editModeInput.blur(); // 讓輸入框失去焦點，觸發 blur 事件
        }
    });

    let isEditingTitle = false; // 是否編輯標題

    // 點擊標題後編輯標題
    const tableTitle = document.querySelector('.table-title');
    tableTitle.addEventListener('click', () => {
        if (!isEditingTitle) {
            isEditingTitle = true;
            const titleText = tableTitle.innerText; // 取得目前標題
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.value = titleText;
            // 失去焦點時(滑鼠點及其他地方、按enter)，退出編輯
            inputElement.addEventListener('blur', () => {
                const cityName = getCityName(); // 取得當前城池名稱
                const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據，若無則初始化為空對象
                const newText = inputElement.value.trim(); // 去頭尾空白
                if (newText !== '') {
                    tableTitle.innerText = newText;
                    siegeData.tableTitle = newText; // 更新攻城紀錄對象中的標題
                }
                else {
                    tableTitle.innerText = titleText;
                    siegeData.tableTitle = titleText; // 更新攻城紀錄對象中的標題
                }
                localStorage.setItem(`siegeData_${cityName}`, JSON.stringify(siegeData)); // 儲存更新後的標題到localStorage
                isEditingTitle = false;
            });
            // 按enter失去焦點
            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    inputElement.blur();
                }
            });
            tableTitle.innerText = '';
            tableTitle.appendChild(inputElement);
            inputElement.focus();
        }
    });

    // 當按下 Enter 鍵時，同樣退出編輯標題狀態
    editModeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            editModeInput.blur(); // 讓輸入框失去焦點，觸發 blur 事件
        }
    });
    
    
    const analysisContainer = document.querySelector('.analysis-container');
    const editButton = document.getElementById('editButton');
    const addButton = document.getElementById('addButton');
    const deleteButton = document.getElementById('deleteButton');
    const cancelButton = document.getElementById('cancelButton');
    const saveButton = document.getElementById('saveButton');
    const table = document.querySelector('.attendanceList tbody');
    const cityName = getCityName();
    let originalData = []; // 存未修改前的資料

    // 初始化資料庫
    let siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據
    if (Object.keys(siegeData).length === 0) { // 若為空集合
        // 資料初始化
        siegeData.tableTitle = '點擊設定表格標題';
        siegeData.troopStandard = '0';
        siegeData.siegeStandard = '0';
        localStorage.setItem(`siegeData_${cityName}`, JSON.stringify(siegeData));
        saveTableData();
    }
    
    loadData();// 加載localStorage中的表格資料，載入畫面
    changeTbodyColor(); // 依攻城標準改變表格顏色

    // 按下編輯按鈕，修改表格資料和展開按鈕列、複選刪除格
    editButton.addEventListener('click', () => {
        originalData = getTableData(); // 儲存原始資料
        makeTableEditable(true);
        toggleButtons(true); // 展開按鈕列(新增、刪除和取消、儲存)
        toggleAnalysisCheckbox(false); // 隱藏"顯示分析結果"
        addSelectCheckboxes(); // 在每列的第一格插入一個checkbox
        toggleAddStandardButton(true); // 添加增加標準按紐
    });

    // 儲存按鈕功能
    saveButton.addEventListener('click', () => {
        checkAttendCheckBoxes(); // 檢查出席checkbox是否正確
        makeTableEditable(false);
        toggleButtons(false); // 收起按鈕列(新增、刪除和取消、儲存)，顯示"編輯"
        toggleAnalysisCheckbox(true); // 顯示"顯示分析結果"
        toggleAddStandardButton(false); // 刪除增加標準按紐
        deleteSelectCheckboxes(); // 刪除每列的第一格的選擇刪除checkbox
        saveTableData(); // 儲存紀錄表到localStorage
        changeTbodyColor(); // 依攻城標準改變表格顏色
        drawAttendanceRatePieChart(); // 畫出席率圖表
        drawSiegeNumBarChart(); // 畫隊伍數量圖表
    });

    // 取消按鈕功能
    cancelButton.addEventListener('click', () => {
        setTableData(originalData); // 恢復原始資料
        makeTableEditable(false);
        toggleButtons(false); // 收起按鈕列(新增、刪除和取消、儲存)，顯示"編輯"
        toggleAnalysisCheckbox(true); // 顯示"顯示分析結果"
        toggleAddStandardButton(false); // 刪除增加標準按紐
        deleteSelectCheckboxes(); // 刪除每列的第一格的選擇刪除checkbox
    });
    
    // 新增一欄空白列
    addButton.addEventListener('click', () => {
        addNewRow();
    });

    // 刪除選擇列
    deleteButton.addEventListener('click', () => {
        deleteSelectedRows();
    });

    // 修改表格內容
    function makeTableEditable(editable) {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const nameCol = row.querySelector('.nameCol');
            const attendCol = row.querySelector('.attendCol');
            const troopCol = row.querySelector('.troopCol');
            const siegeCol = row.querySelector('.siegeCol');

            if (editable) {
                const nameText = nameCol ? nameCol.innerText : '';
                const attendChecked = attendCol ? attendCol.innerText === "是" : false;
                const troopText = troopCol ? troopCol.innerText : '0';
                const siegeText = siegeCol ? siegeCol.innerText : '0';

                if (nameCol) nameCol.innerHTML = `<input type="text" value="${nameText}">`;
                if (attendCol) attendCol.innerHTML = `<input type="checkbox" ${attendChecked ? 'checked' : ''}>`;
                if (troopCol) troopCol.innerHTML = `<input type="number" min="0" max="10" step="1" value="${troopText}">`;
                if (siegeCol) siegeCol.innerHTML = `<input type="number" min="0" max="10" step="1" value="${siegeText}">`;
            } else {
                const nameInput = nameCol ? nameCol.querySelector('input[type="text"]') : null;
                const attendCheckbox = attendCol ? attendCol.querySelector('input[type="checkbox"]') : null;
                const troopInput = troopCol ? troopCol.querySelector('input[type="number"]') : null;
                const siegeInput = siegeCol ? siegeCol.querySelector('input[type="number"]') : null;

                if (nameInput) nameCol.innerText = nameInput.value;
                if (attendCheckbox) attendCol.innerHTML = attendCheckbox.checked ? '是' : '否';
                if (troopInput) troopCol.innerText = troopInput.value;
                if (siegeInput) siegeCol.innerText = siegeInput.value;
            }
        });
    }
    
    // 展開or收合按鈕
    function toggleButtons(editMode) {
        if (editMode) { // 編輯狀態顯示"儲存"、"新增"和"刪除"按鈕
            editButton.style.display = 'none';
            saveButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';
            addButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
        } else { // 確認狀態顯示"編輯"按鈕
            editButton.style.display = 'inline-block';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
            addButton.style.display = 'none';
            deleteButton.style.display = 'none';
        }
    }
    
    // 展開or收合 顯示分析結果checkbox
    function toggleAnalysisCheckbox(saveMode) {
        if (saveMode) { // 儲存狀態顯示"顯示分析結果"checkbox
            analysisContainer.style.display = 'flex';
        } else { // 編輯狀態顯示"顯示分析結果"checkbox
            analysisContainer.style.display = 'none';
        }
    }

    // 添加刪除選擇列checkbox
    function addSelectCheckboxes() {
        // 顯示選擇標題欄
        const select = document.querySelector("th.selectCol");
        select.style.display = 'table-cell';
        
        // 在table body每欄前加上刪除選擇checkbox
        table.querySelectorAll('tr').forEach((row) => {
            const cell = document.createElement('td');
            cell.className = 'selectCol';
            cell.innerHTML = '<input type="checkbox">';
            row.insertBefore(cell, row.firstChild); 
        });
    }

    // 移除刪除選擇列checkbox
    function deleteSelectCheckboxes() {
        // 隱藏選擇標題欄
        const select = document.querySelector("th.selectCol");
        select.style.display = 'none';

        // 刪除table body中的刪除選擇格
        table.querySelectorAll('tr').forEach((row) => {
            const firstCell = row.querySelector('td.selectCol');
            firstCell.remove();
        });
    }

    // 展開or收合 填入標準按鈕
    function toggleAddStandardButton(editMode) {
        const rows = document.querySelectorAll('.attendanceList tbody tr');
        
        rows.forEach(row => {
            if (editMode) {
                const actionTd = document.createElement('td');
                actionTd.classList.add('actionCol'); // 添加class屬性
                const button = document.createElement('button');
                button.innerHTML = '填入<br>標準';
                button.classList.add('fill-standard-button');
                button.addEventListener('click', fillStandard);
                actionTd.appendChild(button);
                row.appendChild(actionTd);
            } else {
                const actionTd = row.querySelector('.actionCol');
                if (actionTd) {
                    row.removeChild(actionTd);
                }
            }
        });
    }
    
    // 填入主力、器械標準值
    function fillStandard(event) {
        const cityName = getCityName();
        const row = event.target.closest('tr');
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據，若無則初始化為空對象
        const troopStandard = siegeData.troopStandard || ''; // 若無數據，則設置為空字符串
        const siegeStandard = siegeData.siegeStandard || ''; // 若無數據，則設置為空字符串
        // 將標準值填入該列的主力數量、器械數量
        row.querySelector('.troopCol').querySelector('input[type="number"]').value = troopStandard;
        row.querySelector('.siegeCol').querySelector('input[type="number"]').value = siegeStandard;
    }

    // 新增空白列
    function addNewRow() {
        const newRow = document.createElement('tr'); // 新增一列資料
        newRow.innerHTML = `
            <td class="selectCol" style="display: table-cell;"><input type="checkbox"></td>
            <td class="nameCol"><input type="text" value=""></td>
            <td class="attendCol"><input type="checkbox"></td>
            <td class="troopCol"><input type="number" min="0" max="10" step="1" value="0"></td>
            <td class="siegeCol"><input type="number" min="0" max="10" step="1" value="0"></td>
            <td class="actionCol"></td>
        `;
        table.appendChild(newRow);

        // 為新行添加填入標準按鈕(勿使用onclick呼叫函式，會報錯)
        const actionTd = newRow.querySelector('.actionCol');
        const button = document.createElement('button');
        button.innerHTML = '填入<br>標準';
        button.classList.add('fill-standard-button');
        button.addEventListener('click', fillStandard);
        actionTd.appendChild(button);
    }

    // 刪除所選列資料
    function deleteSelectedRows() {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const checkbox = row.querySelector('.selectCol input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                table.removeChild(row);
            }
        });
    }

    // 檢查出席checkbox是否正確
    function checkAttendCheckBoxes() {
        const rows = document.querySelectorAll('.attendanceList tbody tr');

        rows.forEach(row => {
            const attendCheckbox = row.querySelector('.attendCol').querySelector('input[type="checkbox"]');
            const troopNum = parseInt(row.querySelector('.troopCol input[type="number"]').value);
            const siegeNum = parseInt(row.querySelector('.siegeCol input[type="number"]').value);

            if (troopNum <= 0 && siegeNum <= 0) {
                attendCheckbox.checked = false;
            } else {
                attendCheckbox.checked = true;
            }
        });
    }

    // 取得表格資料
    function getTableData() {
        const rows = table.querySelectorAll('tr');
        const data = [];
        rows.forEach(row => {
            const nameCol = row.querySelector('.nameCol') ? row.querySelector('.nameCol').innerText : '';
            const attendCol = row.querySelector('.attendCol') ? row.querySelector('.attendCol').innerText : '';
            const troopCol = row.querySelector('.troopCol') ? row.querySelector('.troopCol').innerText : '0';
            const siegeCol = row.querySelector('.siegeCol') ? row.querySelector('.siegeCol').innerText : '0';
            data.push({ nameCol, attendCol, troopCol, siegeCol });
        });
        return data;
    }

    // 保存表格資料到localStorage
    function saveTableData() {
        const cityName = getCityName();
        const data = getTableData(); 
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {}; // 讀取當前城池的數據，若無則初始化為空對象
        const troopStandard = siegeData.troopStandard || ''; // 若無數據，則設置為空字符串
        const siegeStandard = siegeData.siegeStandard || ''; // 若無數據，則設置為空字符串
        
        let attendanceData = data.map(item => {
            // 判斷是否達標
            const standard = item.attendCol === '是' && Number(item.troopCol) >= parseInt(troopStandard) && Number(item.siegeCol) >= parseInt(siegeStandard);
            return {
                ...item,
                standard
            };
        });

        // 更新siegeData中的attendanceData
        siegeData.attendanceData = attendanceData;
        // 將資料存入localStorage
        localStorage.setItem(`siegeData_${cityName}`, JSON.stringify(siegeData)); 
    }

    // 設置表格資料
    function setTableData(data) {
        table.innerHTML = ''; // 清空目前表格
        data.forEach((item) => { // 將所有資料填入table body
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td class="nameCol">${item.nameCol}</td>
                <td class="attendCol">${item.attendCol}</td>
                <td class="troopCol">${item.troopCol}</td>
                <td class="siegeCol">${item.siegeCol}</td>
            `;
            table.appendChild(newRow);
        });
    }

    // 從localStorage下載資料
    function loadData() {
        const cityName = getCityName();
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)); // 從localStorage取出數據

        if (siegeData.attendanceData) {
            setTableData(siegeData.attendanceData); // 設置表格數據
        }

        const tableTitle = document.querySelector('.table-title');
        tableTitle.innerText = siegeData.tableTitle; // 設置攻城標題
        
        const troopStandard = document.getElementById('troopStandardText');
        troopStandard.innerText = siegeData.troopStandard; // 設置主力標準數量

        const siegeStandard = document.getElementById('siegeStandardText');
        siegeStandard.innerText = siegeData.siegeStandard; // 設置器械標準數量

        if (siegeData.siegeTime) {
            const formattedDate = "攻城時間: " + siegeData.siegeTime.replace('T', ' '); // 修改時間顯示方式
            dateTimeDisplay.querySelector('.display-mode').innerText = formattedDate; // 設置攻城時間
            editModeInput.value = siegeData.siegeTime; // 將存儲的時間設置到輸入框的值
        }

        drawAttendanceRatePieChart();
        drawSiegeNumBarChart();
    }

    // 依攻城標準變換表格顏色
    function changeTbodyColor() {
        const rows = document.querySelectorAll('.attendanceList tbody tr');
        rows.forEach(row => {
            const attendance = row.querySelector('.attendCol').innerText;
            const troopCount = parseInt(row.querySelector('.troopCol').innerText);
            const siegeCount = parseInt(row.querySelector('.siegeCol').innerText);

            const troopStandard = parseInt(document.getElementById('troopStandardText').innerText);
            const siegeStandard = parseInt(document.getElementById('siegeStandardText').innerText);

            if (attendance === '否') {
                row.style.backgroundColor = '#ffd4d4'; // 未出席淺橘色
            } else if (troopCount < troopStandard || siegeCount < siegeStandard) {
                row.style.backgroundColor = 'lightyellow'; // 出席未達標淺黃色
            } else {
                row.style.backgroundColor = '#eaf8f8'; // 清除背景顏色
            }
        });
    }

    // 監聽顯示分析結果checkBox，顯示或隱藏圖表
    const showAnalysisCheckbox = document.getElementById('showAnalysis');
    showAnalysisCheckbox.addEventListener('change', (event) => {
        const analysisChart = document.getElementById('analysisChart');
        if (event.target.checked) {
            analysisChart.style.display = 'block'; // 顯示圖表
        } else {
            analysisChart.style.display = 'none'; // 隱藏圖表
        }
    });

    // 計算出席率數據
    function calculateAttendanceData() {
        const cityName = getCityName();
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {};
        const attendanceData = siegeData.attendanceData || [];
        let attendedAndMetPlayers = '';
        let attendedNotMetPlayers = '';
        let notAttendedPlayers = '';
        let attendedUpToStandardNum = 0;
        let attendedNotUpToStandardNum = 0;
        let notAttendedNum = 0;
        
        // 分別計算出席且達標、出席但未達標、未出席的人數
        attendanceData.forEach((item, index) => {
            if (item.standard) { // 是否達標(達標必出席)
                attendedUpToStandardNum++; // 出席且達標
                attendedAndMetPlayers += item.nameCol + '、'; // 填入達標玩家名稱
            } else if(item.attendCol === '是') { // 若沒達標，判斷是否出席
                attendedNotUpToStandardNum++; // 出席但未達標
                attendedNotMetPlayers += item.nameCol + '、'; // 填入未達標玩家名稱
            } else {
                notAttendedNum++; // 沒出席
                notAttendedPlayers += item.nameCol + '、'; // 填入未出席玩家名稱
            }

            // 去掉尾巴的頓號
            if (index == attendanceData.length - 1) {
                attendedAndMetPlayers = attendedAndMetPlayers.slice(0, -1);
                attendedNotMetPlayers = attendedNotMetPlayers.slice(0, -1);
                notAttendedPlayers = notAttendedPlayers.slice(0, -1);
            }

            // 更新 HTML 内容
            document.getElementById('attendedAndMet').innerHTML = attendedAndMetPlayers;
            document.getElementById('attendedNotMet').innerHTML = attendedNotMetPlayers;
            document.getElementById('notAttended').innerHTML = notAttendedPlayers;
        });

        return { // 回傳各類別數量
            attendedUpToStandardNum,
            attendedNotUpToStandardNum,
            notAttendedNum
        };
    }

    // 畫出席率圓餅圖
    function drawAttendanceRatePieChart() {
        const attendanceData = calculateAttendanceData();
        var attendanceRatePieChart = echarts.init(document.getElementById("attendanceRate")); // 將圓餅圖畫在指定div中

        var option = {
            title: {
                text: '組員出席率'
            },
            tooltip: {
                trigger: "item",
                formatter: "{a} <br>{b}: {c} ({d}%)"
                // {a}: 資料所屬名稱，對應series的name
                // {b}: 資料種類的name，對應series的data[name]
                // {c}: 資料的值，對應series的data[value]
                // {d}: 每筆資料占比(%)
            },
            legend: {
                orient: "vertical", // 垂直顯示
                left: 10,
                top: 30,
                data: ['有出席且達標', '有出席但未達標', '未出席']
            },
            series: [{
                name: '時間組出席率',
                type: 'pie',
                radius: ["45%", "70%"],
                data: [
                    {value: attendanceData.attendedUpToStandardNum, name: '有出席且達標'},
                    {value: attendanceData.attendedNotUpToStandardNum, name: '有出席但未達標'},
                    {value: attendanceData.notAttendedNum, name: '未出席'},
                ]
            }]
        };

        attendanceRatePieChart.setOption(option);
    }

    // 畫主力、車子數量柱狀圖
    function drawSiegeNumBarChart() {
        const cityName = getCityName();
        const siegeData = JSON.parse(localStorage.getItem(`siegeData_${cityName}`)) || {};
        const attendanceData = siegeData.attendanceData || [];
        var siegeNumBarChart = echarts.init(document.getElementById("siegeNum")); // 將圓餅圖畫在指定div中

        // 資料預處理
        var xAxis = [] // x軸資料
        var troopNum = [] // y軸data1
        var siegeNum = [] // y軸data2
        attendanceData.forEach(item => {
            xAxis.push(item.nameCol);
            troopNum.push(item.troopCol);
            siegeNum.push(item.siegeCol);
        });

        var option = {
            title: {
                text: '主力、車子出席數量'
            },
            tooltip: {
                trigger: "axis"
            },
            legend: { // 圖例
                data: ['主力出席數量', '車子出席數量'],
            },
            xAxis: {
                type: 'category',
                name: '盟友ID',
                data: xAxis,
                axisLabel: { // 資料過多會顯示不完全，透過旋轉文字解決
                    interval: 0, // 顯示所有資料
                    rotate: 50, // 旋轉30度顯示x軸資料
                }
            },
            yAxis: {
                type: 'value',
                name: '出席數量(隊)'
            },
            series: [{
                name: '主力出席數量',
                type: 'bar',
                data: troopNum
            },{
                name: '車子出席數量',
                type: 'bar',
                data: siegeNum
            }]
        };

        siegeNumBarChart.setOption(option);
    }
});