# Reinforcement Learning HW1: GridWorld Value Iteration AI

這是強化學習作業一（HW1）的實作專案，旨在透過直觀的 Web 圖形化介面，展示馬可夫決策過程（MDP）中的**策略評估（Policy Evaluation）**與**價值迭代（Value Iteration）**。

## 📌 作業要求對應 (HW1 Features)
## demo 影片


https://github.com/user-attachments/assets/c17b888a-d816-4df0-9b69-2946a476db5f
## prompt history
log.md


### [HW1-1] 網格地圖開發
- 🗺️ 支援動態指定大小 `$n \times n$` 的網格地圖（$n$ 的範圍支援 `5` 到 `9`）。
- 🟢 點擊 `Set Start Point` 模式：設定起始單元格（綠色）。
- 🔴 點擊 `Set End Point` 模式：設定結束單元格（紅色）。
- ⚪ 點擊 `Toggle Block` 模式：設定最多 $n-2$ 個障礙物單元格（灰色白色底）。

### [HW1-2] 策略顯示與價值評估
- 🎲 點擊 **"Show Random Policy"** 後，系統將幫每一個格子隨機生成「確定性策略」（上下左右隨機抽一個方向箭頭）。
- 🧮 面板將透過後端的**策略評估**演算法，直接推導出並在單元格顯示每個狀態的對應價值函數 $V(s)$。

### [HW1-3] 價值迭代算法推導最佳政策
- 🚀 點擊 **"Run Value Iteration"** 後，將透過價值迭代演算法計算。
- 🌟 各格子中推導出的**最佳政策（箭頭）**會直接取代先前的隨機箭頭。
- 📊 各格子內也會同時更新顯示最佳政策下該狀態的期望回報 $V^*(s)$。
- 🪄 附帶一條直觀的亮黃色行動軌跡（Path highlights），視覺化顯示從起點走到終點的最佳路徑。

---

## 🛠️ 技術站 (Tech Stack)
- **Backend:** Python, Flask, NumPy
- **Frontend:** Vanilla JavaScript, HTML5, CSS3 
- **Styling UI:** 現代化玻璃擬態風格（Glassmorphism）、FontAwesome

## 🚀 如何運行 (How to Run)

### 1. 安裝環境依賴
確保您的電腦上已安裝 Python 3.x，接著安裝必備套件：
```bash
pip install flask numpy
```

### 2. 啟動 Flask 伺服器
在終端機中移動至本專案目錄下，並執行後端程式：
```bash
python app.py
```

### 3. 開啟網頁
伺服器運行後，開啟瀏覽器並前往本地端位址：
```text
http://127.0.0.1:5000
```
或 
```text
http://localhost:5000
```

---

## 💡 使用說明範例
1. **預設狀態**：網頁載入時，系統會幫您預先填好 `$n=5$`、起始點 `(0,0)`、終點 `(4,4)` 以及三個障礙物 `(1,1), (2,2), (3,3)`，完美符合最基礎測試案例的需求。
2. **改變網格大小**：直接拖動左上角的 `Grid Size` 拉桿。
3. **更改起終點與障礙**：選擇上方的 Mode Toggle（Set Start / Set End / Toggle Block），接著點選地圖上的任一格子。
4. **展示演算法效果**：最後使用底下的兩個大按鈕觀察馬可夫決策演算法的收斂動畫。
