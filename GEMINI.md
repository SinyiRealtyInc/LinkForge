# 函數式程式設計 (FP) 開發規範

為了提升程式碼的可測試性、可預測性和可維護性，本專案遵循以下函數式程式設計的核心原則。我們的目標不是追求 100% 的純度，而是**將「純粹的計算邏輯」與「不純的副作用」清晰地分離開來**。

## 核心原則：分離關注點 (Separation of Concerns)

所有程式碼都應該被歸類為以下兩者之一：

1. **純粹邏輯 (The Pure Core)**：負責「計算」。
2. **邊界/副作用 (The Impure Boundary)**：負責與外界「互動」。

---

## 1. 純函數 (Pure Functions) - 你的主要工具

純函數是可靠、可預測且易於測試的程式碼。

### 1.1 基本規範

- **只做計算**：一個函數的職責應該是接收輸入，進行計算，然後 `return` 結果。
- **無副作用**：嚴禁在純函數內部進行任何外部互動。
  - **禁止**：`console.log`、讀寫檔案 (`fs`)、網路請求 (`got`)、資料庫操作。
  - **禁止**：讀取或修改任何在函數外部定義的變數（全域變數、快取等）。
  - **禁止**：依賴不穩定的輸入，如 `Date.now()` 或 `Math.random()`。如果需要，應將它們作為參數傳入。
- **不可變性**：絕不修改傳入的參數（特別是物件或陣列）。永遠回傳一個新的複本。

### 1.2 程式碼範例

**✅ 好的範例：**
```javascript
// 給定輸入，永遠回傳相同輸出，沒有副作用
function createApnsPayload(title, body) {
  return {
    aps: {
      alert: { title, body }
    }
  };
}

// 處理複雜業務邏輯的純函數
function calculateOrderTotal(items, discountRate = 0, taxRate = 0.1) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * discountRate;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * taxRate;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    total: taxableAmount + taxAmount
  };
}

// 資料轉換的純函數
function transformUserData(rawUser) {
  return {
    id: rawUser.id,
    name: rawUser.firstName + ' ' + rawUser.lastName,
    email: rawUser.email?.toLowerCase(),
    isActive: rawUser.status === 'active',
    createdAt: new Date(rawUser.created_timestamp)
  };
}
```

**❌ 錯誤範例：**
```javascript
// BAD: 修改了外部變數，這是一個副作用
let errorCount = 0;
function createPayloadWithError(title, body) {
  if (!title) {
    errorCount++; // ❌ 副作用！
  }
  return { aps: { alert: { title, body } } };
}

// BAD: 直接修改了輸入參數
function addItemToCart(cart, item) {
  cart.items.push(item); // ❌ 修改了原始物件！
  return cart;
}

// BAD: 依賴外部狀態
function getCurrentUserOrder() {
  return orders.find(order => order.userId === currentUserId); // ❌ 依賴全域變數！
}
```

### 1.3 錯誤處理策略

在純函數中，我們不應該拋出異常，而是透過回傳值來表示錯誤狀態：

```javascript
// 使用 Result 模式處理錯誤
function divideNumbers(a, b) {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}

// 使用 Maybe/Optional 模式處理可能不存在的值
function findUserById(users, id) {
  const user = users.find(u => u.id === id);
  return user ? { hasValue: true, value: user } : { hasValue: false };
}

// 錯誤傳播的純函數鏈
function processUserData(rawData) {
  const validationResult = validateUserData(rawData);
  if (!validationResult.success) {
    return validationResult;
  }
  
  const transformResult = transformUserData(validationResult.value);
  return { success: true, value: transformResult };
}
```

### 1.4 效能考量

**避免不必要的計算：**
```javascript
// BAD: 每次都重新計算
function expensiveCalculation(data) {
  return data.map(item => {
    // 複雜的計算邏輯
    return heavyProcessing(item);
  });
}

// GOOD: 將計算邏輯分離，便於快取
function processItem(item) {
  return heavyProcessing(item);
}

function processAllItems(data) {
  return data.map(processItem);
}
```

**避免深度嵌套的函數調用：**
```javascript
// BAD: 深度嵌套
function processOrder(order) {
  return calculateTotal(
    applyDiscount(
      validateItems(
        normalizeItems(order.items)
      ),
      order.discountCode
    )
  );
}

// GOOD: 使用函數組合
function processOrder(order) {
  const normalizedItems = normalizeItems(order.items);
  const validatedItems = validateItems(normalizedItems);
  const discountedItems = applyDiscount(validatedItems, order.discountCode);
  return calculateTotal(discountedItems);
}
```

### 1.5 純函數測試指南

純函數非常容易測試，因為它們的行為完全可預測：

```javascript
// 測試範例
describe('calculateOrderTotal', () => {
  it('應該正確計算沒有折扣和稅的訂單總額', () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ];
    
    const result = calculateOrderTotal(items);
    
    expect(result.subtotal).toBe(250);
    expect(result.total).toBe(275); // 250 + 10% 稅
  });
  
  it('應該正確處理折扣', () => {
    const items = [{ price: 100, quantity: 1 }];
    const result = calculateOrderTotal(items, 0.1, 0.1);
    
    expect(result.discountAmount).toBe(10);
    expect(result.total).toBe(99); // (100-10) * 1.1
  });
  
  it('應該處理空陣列', () => {
    const result = calculateOrderTotal([]);
    expect(result.total).toBe(0);
  });
});

// 錯誤處理的測試
describe('divideNumbers', () => {
  it('應該回傳正確的除法結果', () => {
    const result = divideNumbers(10, 2);
    expect(result.success).toBe(true);
    expect(result.value).toBe(5);
  });
  
  it('應該處理除以零的錯誤', () => {
    const result = divideNumbers(10, 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Division by zero');
  });
});
```

**測試的最佳實踐：**
- 每個純函數都應該有對應的單元測試
- 測試各種邊界情況（空值、極端值、錯誤輸入）
- 使用表格驅動測試來測試多種輸入組合
- 測試覆蓋率應該接近 100%

---

## 2. 邊界函式 (Boundary Functions) - 管理副作用

我們無法避免副作用，但可以把它們關在「籠子」裡。邊界函式就是這個籠子。

### 2.1 基本規範

- **職責單一**：一個邊界函式應該只負責一項與外部世界的互動。
- **組合而非混合**：邊界函式應該負責**呼叫 (組合)** 純函數來準備數據或處理結果，而不是自己進行複雜的計算。
- **明確命名**：函式名稱應清楚地表明其副作用，例如 `readPrivateKeyFromFile`、`sendApnsRequest`、`saveTokenToCache`。

### 2.2 程式碼範例

**✅ 好的範例：**
```javascript
// 職責清晰，只負責發送網路請求
async function sendAPNsRequest(deviceToken, payload) {
  const url = `https://api.push.apple.com/3/device/${deviceToken}`;
  return got(url, { json: payload });
}

// 複雜的邊界函式範例
async function processUserRegistration(userData) {
  try {
    // 1. 呼叫純函數進行資料驗證和轉換
    const validationResult = validateUserData(userData);
    if (!validationResult.success) {
      throw new Error(validationResult.error);
    }
    
    const transformedUser = transformUserData(validationResult.value);
    
    // 2. 執行副作用：資料庫操作
    const savedUser = await saveUserToDatabase(transformedUser);
    
    // 3. 執行副作用：發送歡迎郵件
    await sendWelcomeEmail(savedUser.email, savedUser.name);
    
    // 4. 執行副作用：記錄日誌
    console.log(`User registered: ${savedUser.id}`);
    
    return savedUser;
  } catch (error) {
    // 5. 錯誤處理和日誌記錄
    console.error('Registration failed:', error.message);
    throw error;
  }
}
```

### 2.3 錯誤處理與調試

邊界函式中的錯誤處理更加複雜，因為需要處理各種副作用失敗的情況：

```javascript
// 完整的錯誤處理範例
async function processOrder(orderData) {
  let transaction;
  
  try {
    // 1. 資料驗證（純函數）
    const validationResult = validateOrderData(orderData);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error);
    }
    
    // 2. 開始資料庫事務
    transaction = await beginTransaction();
    
    // 3. 保存訂單
    const savedOrder = await saveOrder(validationResult.value, transaction);
    
    // 4. 更新庫存
    await updateInventory(savedOrder.items, transaction);
    
    // 5. 處理付款
    const paymentResult = await processPayment(savedOrder.total, savedOrder.paymentMethod);
    if (!paymentResult.success) {
      throw new PaymentError(paymentResult.error);
    }
    
    // 6. 確認事務
    await commitTransaction(transaction);
    
    // 7. 發送確認郵件
    await sendOrderConfirmation(savedOrder);
    
    return savedOrder;
    
  } catch (error) {
    // 回滾事務
    if (transaction) {
      await rollbackTransaction(transaction);
    }
    
    // 根據錯誤類型進行不同的處理
    if (error instanceof ValidationError) {
      console.warn('Validation failed:', error.message);
    } else if (error instanceof PaymentError) {
      console.error('Payment failed:', error.message);
      // 可能需要通知管理員
    } else {
      console.error('Unexpected error:', error);
    }
    
    throw error;
  }
}
```

### 2.4 副作用測試策略

測試邊界函式需要使用模擬（Mock）和存根（Stub）：

```javascript
// 測試範例
describe('processUserRegistration', () => {
  let mockSaveUser, mockSendEmail, mockConsoleLog;
  
  beforeEach(() => {
    mockSaveUser = jest.fn();
    mockSendEmail = jest.fn();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('應該成功處理用戶註冊', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };
    const savedUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    
    mockSaveUser.mockResolvedValue(savedUser);
    mockSendEmail.mockResolvedValue(true);
    
    // Act
    const result = await processUserRegistration(userData);
    
    // Assert
    expect(result).toEqual(savedUser);
    expect(mockSaveUser).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      name: 'Test User'
    }));
    expect(mockSendEmail).toHaveBeenCalledWith('test@example.com', 'Test User');
    expect(mockConsoleLog).toHaveBeenCalledWith('User registered: 1');
  });
  
  it('應該處理資料驗證失敗', async () => {
    // Arrange
    const invalidData = { email: 'invalid-email' };
    
    // Act & Assert
    await expect(processUserRegistration(invalidData))
      .rejects.toThrow('Invalid email format');
      
    expect(mockSaveUser).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
```

---

## 3. 路由處理器 (Route Handlers) - 最終的邊界

Express 的路由處理器是我們應用程式最外層的邊界，是所有邏輯的「總指揮」。

### 3.1 基本規範

- **保持精簡**：路由處理器本身應盡可能簡短。它的職責是解析請求 (`req`)，然後像指揮家一樣，依序呼叫其他函式（純函數和邊界函式）。
- **只做組合**：它負責組合整個操作流程，並最終使用 `res.send()` 或 `res.json()` 來結束請求。

### 3.2 程式碼範例

**✅ 好的範例：**
```javascript
// 簡單的路由處理器
router.post("/push/:deviceToken", async (req, res) => {
  try {
    // 1. 呼叫純函數準備數據
    const payload = createApnsPayload("Title", "Body");
    // 2. 呼叫邊界函式執行副作用
    const response = await sendApnsRequest(req.params.deviceToken, payload);
    // 3. 結束請求
    res.status(200).json({ success: true, response: response.body });
  } catch (error) {
    // 處理錯誤也是一種副作用
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 複雜業務邏輯的路由處理器
router.post("/orders", async (req, res) => {
  try {
    // 1. 輸入驗證和轉換（純函數）
    const validationResult = validateOrderRequest(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error });
    }
    
    // 2. 業務邏輯處理（邊界函式）
    const order = await processOrder(validationResult.value);
    
    // 3. 響應格式化（純函數）
    const responseData = formatOrderResponse(order);
    
    // 4. 回傳結果
    res.status(201).json(responseData);
    
  } catch (error) {
    // 統一的錯誤處理
    handleRouteError(error, res);
  }
});
```

### 3.3 錯誤處理最佳實踐

```javascript
// 統一的錯誤處理函數
function handleRouteError(error, res) {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
  } else if (error instanceof PaymentError) {
    res.status(402).json({ error: error.message });
  } else {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 使用中間件進行統一錯誤處理
router.use((error, req, res, next) => {
  handleRouteError(error, res);
});
```

---

## 4. 常見反模式與重構範例

### 4.1 反模式：混合計算與副作用

**❌ 錯誤範例：**
```javascript
// BAD: 在同一個函數中混合了計算和副作用
async function processUserOrder(userId, items) {
  console.log(`Processing order for user ${userId}`); // 副作用
  
  // 計算邏輯
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const tax = total * 0.1;
  const finalTotal = total + tax;
  
  // 更多副作用
  await saveOrder({ userId, items, total: finalTotal });
  await sendEmail(userId, `Your order total: $${finalTotal}`);
  
  return finalTotal;
}
```

**✅ 重構後：**
```javascript
// GOOD: 分離計算和副作用
// 純函數 - 只做計算
function calculateOrderTotal(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
}

// 邊界函式 - 處理副作用
async function processUserOrder(userId, items) {
  console.log(`Processing order for user ${userId}`);
  
  const orderCalculation = calculateOrderTotal(items);
  
  await saveOrder({ 
    userId, 
    items, 
    ...orderCalculation 
  });
  
  await sendEmail(userId, `Your order total: $${orderCalculation.total}`);
  
  return orderCalculation;
}
```

### 4.2 反模式：直接修改輸入參數

**❌ 錯誤範例：**
```javascript
// BAD: 直接修改輸入
function addDiscountToItems(items, discountRate) {
  items.forEach(item => {
    item.discountedPrice = item.price * (1 - discountRate);
  });
  return items;
}
```

**✅ 重構後：**
```javascript
// GOOD: 回傳新的物件
function addDiscountToItems(items, discountRate) {
  return items.map(item => ({
    ...item,
    discountedPrice: item.price * (1 - discountRate)
  }));
}
```

### 4.3 反模式：依賴全域狀態

**❌ 錯誤範例：**
```javascript
// BAD: 依賴全域變數
let currentUser = null;
let appConfig = {};

function getUserOrder() {
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  return orders.filter(order => 
    order.userId === currentUser.id && 
    order.status === appConfig.defaultOrderStatus
  );
}
```

**✅ 重構後：**
```javascript
// GOOD: 將依賴作為參數傳入
function getUserOrders(orders, userId, defaultStatus) {
  return orders.filter(order => 
    order.userId === userId && 
    order.status === defaultStatus
  );
}

// 在邊界函式中組合
async function getCurrentUserOrders() {
  const user = await getCurrentUser();
  const orders = await getAllOrders();
  const config = await getAppConfig();
  
  return getUserOrders(orders, user.id, config.defaultOrderStatus);
}
```

---

## 5. 效能最佳化指南

### 5.1 避免不必要的物件創建

**❌ 低效率範例：**
```javascript
// BAD: 每次都創建新物件
function processItems(items) {
  return items.map(item => {
    return {
      ...item,
      processedAt: new Date(),
      metadata: {
        version: '1.0',
        source: 'api'
      }
    };
  });
}
```

**✅ 最佳化後：**
```javascript
// GOOD: 複用不變的物件
const METADATA_TEMPLATE = {
  version: '1.0',
  source: 'api'
};

function processItems(items, currentTime = new Date()) {
  return items.map(item => ({
    ...item,
    processedAt: currentTime,
    metadata: METADATA_TEMPLATE
  }));
}
```

### 5.2 使用適當的資料結構

```javascript
// 使用 Map 進行快速查找
function createUserLookup(users) {
  return new Map(users.map(user => [user.id, user]));
}

function enrichOrdersWithUserInfo(orders, userLookup) {
  return orders.map(order => ({
    ...order,
    user: userLookup.get(order.userId)
  }));
}

// 使用 Set 進行快速成員檢查
function filterActiveUsers(users, activeUserIds) {
  const activeSet = new Set(activeUserIds);
  return users.filter(user => activeSet.has(user.id));
}
```

### 5.3 函數記憶化 (Memoization)

```javascript
// 簡單的記憶化實現
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 使用記憶化來快取昂貴的計算
const expensiveCalculation = memoize((data) => {
  // 複雜的計算邏輯
  return data.reduce((acc, item) => acc + complexProcess(item), 0);
});
```

### 5.4 批次處理

```javascript
// 批次處理大量資料
function processBatch(items, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResult = batch.map(processItem);
    results.push(...batchResult);
  }
  
  return results;
}

// 非同步批次處理
async function processAsyncBatch(items, asyncProcessor, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(asyncProcessor);
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}
```

---

## 6. 調試技巧

### 6.1 函數式程式碼的調試策略

```javascript
// 使用 tap 函數進行調試
function tap(label) {
  return function(value) {
    console.log(`[${label}]:`, value);
    return value;
  };
}

// 在函數鏈中使用 tap 進行調試
function processUserData(rawData) {
  return rawData
    .map(tap('Raw data'))
    .map(validateUserData)
    .map(tap('After validation'))
    .map(transformUserData)
    .map(tap('After transformation'))
    .filter(user => user.isActive)
    .map(tap('Active users only'));
}
```

### 6.2 錯誤追蹤

```javascript
// 增強的錯誤處理，包含調試資訊
function createDetailedError(message, context = {}) {
  const error = new Error(message);
  error.context = context;
  error.timestamp = new Date().toISOString();
  error.stack = error.stack;
  return error;
}

// 在邊界函式中使用詳細的錯誤資訊
async function processOrderWithDebugging(orderData) {
  try {
    const validationResult = validateOrderData(orderData);
    if (!validationResult.success) {
      throw createDetailedError('Order validation failed', {
        orderData,
        validationErrors: validationResult.errors
      });
    }
    
    // 其他處理邏輯...
    
  } catch (error) {
    console.error('Order processing failed:', {
      error: error.message,
      context: error.context,
      timestamp: error.timestamp
    });
    throw error;
  }
}
```

---

## 總結：寫程式時的思考流程

寫程式時，先問自己：「這段邏輯是在『計算』還是在『互動』？」

- **如果是計算** → 把它放進一個**純函數**。
- **如果是互動** → 把它放進一個職責單一的**邊界函式**。
- **最後，在路由處理器中，將它們優雅地組合起來。**

### 開發檢查清單

在寫每個函數時，問自己：

1. **這個函數是純函數嗎？**
   - [ ] 相同輸入總是回傳相同輸出
   - [ ] 沒有副作用
   - [ ] 不修改輸入參數

2. **這個函數的職責是否單一？**
   - [ ] 只做一件事
   - [ ] 函數名稱清楚表達意圖
   - [ ] 參數和回傳值有明確的型別

3. **這個函數是否容易測試？**
   - [ ] 已寫出對應的單元測試
   - [ ] 測試覆蓋各種邊界情況
   - [ ] 錯誤處理有適當的測試

4. **這個函數的效能是否合理？**
   - [ ] 避免不必要的計算
   - [ ] 使用適當的資料結構
   - [ ] 考慮記憶化或快取

透過遵循這些原則，我們可以建立出既優雅又實用的函數式程式碼，提升整體的程式碼品質和團隊的開發效率。