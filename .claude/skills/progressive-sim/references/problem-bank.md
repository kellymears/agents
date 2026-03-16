# Problem Bank

Each domain below follows the progressive level structure used by the CodeSignal Industry Coding Assessment (ICA):

- **L1:** Basic CRUD (3-4 methods)
- **L2:** Filtering & querying (scan, prefix/suffix match, typed collection returns)
- **L3:** Time-awareness (timestamps, TTL, expiration, time-parameterized variants)
- **L4:** State management (backup/restore, snapshots, compression)

When generating a simulation, pick one and flesh it out into a full spec. You can also invent new domains that follow the same structural pattern.

## Provenance

Domains are tagged by origin:

- **Reported** — Described by candidates in public forums or interview prep sites as appearing in real Anthropic CodeSignal assessments. Method names and exact specs may differ from the actual assessment; these are reconstructions from candidate accounts.
- **Structural match** — Original domains invented for this problem bank. They follow the same L1→L4 progressive pattern as reported domains but have not been reported as actual assessment questions.

## Sources

### Assessment format

- [CodeSignal ICA rules and structure](https://support.codesignal.com/hc/en-us/articles/19116922232983-What-are-the-Industry-Coding-Assessment-ICA-rules) — Official CodeSignal documentation confirming the 4-level progressive format, 90-minute time limit, and project-based structure.
- [CodeSignal Industry Coding Skills Evaluation Framework (PDF)](https://discover.codesignal.com/rs/659-AFH-023/images/Industry-Coding-Skills-Evaluation-Framework-CodeSignal-Skills-Evaluation-Lab-Short.pdf) — Technical brief on the ICA evaluation framework.
- [PaulLockett/CodeSignal_Practice_Industry_Coding_Framework](https://github.com/PaulLockett/CodeSignal_Practice_Industry_Coding_Framework) — Community practice repo for the ICA format.

### Anthropic assessment reports (candidate accounts)

- [Anthropic OA — In Memory Database (aonecode)](https://aonecode.com/iq/docs/antropic/online-assessment/in-memory-db) — Detailed reconstruction of the in-memory database question.
- [Anthropic OA — Cloud Storage System (aonecode)](https://aonecode.com/iq/docs/antropic/online-assessment/cloud-storage-system) — Cloud storage / file system domain question.
- [Anthropic OA — How it works (aonecode)](https://aonecode.com/iq/docs/antropic/online-assessment/how-it-works) — General format overview.
- [Anthropic Online Assessment 2025: Questions Breakdown (Lodely)](https://www.lodely.com/blog/anthropic-oa) — Prep guide listing reported domains: in-memory DBs, file systems, inventory systems, command processors.
- [How I Practiced Anthropic CodeSignal and Passed (LinkJob)](https://www.linkjob.ai/interview-questions/codesignal-anthropic-practice) — Candidate experience with assessment strategy.
- [Anthropic Coding Interview: 2026 Question Bank (LinkJob)](https://www.linkjob.ai/interview-questions/anthropic-coding-interview) — Collected question reports including chat messaging and inventory domains.
- [Anthropic Pre-Screen Coding Assessment 2026 (AI Offerly)](https://www.aiofferly.com/career-guide/anthropic-pre-screen-coding-assessment-2026) — Format overview and prep guide.
- [Anthropic CodeSignal Assessment Guide (FinalRoundAI)](https://www.finalroundai.com/blog/how-to-ace-your-anthropic-code-signal-assessment-a-step-by-step-guide) — Step-by-step guide mentioning chat application and key-value store domains.

### Candidate experience threads

- [Anthropic Codesignal Experience (Blind)](https://www.teamblind.com/post/Anthropic-Codesignal-Experience-Jzww5q7T) — Candidate report on difficulty, timing, and scoring.
- [Anthropic Code Signal (Blind)](https://www.teamblind.com/post/anthropic-code-signal-ylzu3o5u) — Interview experience thread.
- [Anthropic Codesignal Industry Coding Assessment (Blind)](https://www.teamblind.com/post/Anthropic-Codesignal-Industry-Coding-Assessment-zJtsoJd6) — ICA-specific discussion.
- [Anthropic CodeSignal Passing Score (Blind)](https://www.teamblind.com/post/Anthropic-CodeSignal-Passing-Score-aWOaMCAW) — Scoring discussion.

### General interview process

- [Anthropic Interview Process (interviewing.io)](https://interviewing.io/anthropic-interview-questions) — Full pipeline overview including OA stage.
- [Anthropic Interview Process & Timeline (IGotAnOffer)](https://igotanoffer.com/en/advice/anthropic-interview-process) — Timeline and stage breakdown.

---

## 1. Inventory Management System

**Provenance:** Reported — Listed as a common OA pattern by Lodely and LinkJob. Exact method signatures are reconstructed; the real assessment may differ.

**Summary:** Manage products in a warehouse with stock tracking, search, time-based pricing, and state snapshots.

- **L1:** Basic product CRUD. `addProduct(id, name, price, quantity)` — returns `boolean` (true if added, false if id exists). `getProduct(id)` — returns `{ name: string; price: number } | null`. `removeProduct(id)` — returns `boolean` (true if existed). `listProducts()` — returns `Array<{ name: string; price: number }>` sorted lexicographically by name.
- **L2:** Search and filtering. `scanByPrefix(prefix)` — returns products whose names start with prefix as `Array<{ name: string; quantity: number }>` sorted lexicographically by name. `scanByPriceRange(minPrice, maxPrice)` — returns `Array<{ name: string; price: number }>` sorted by price then name. `getProductsByQuantity(minQty)` — returns `Array<{ name: string; quantity: number }>` sorted by quantity descending then name.
- **L3:** Timestamped operations and TTL. `addProductAt(id, name, price, quantity, timestamp)` — like `addProduct` but records the timestamp, returns `boolean`. `setDiscount(id, discountPercent, timestamp, durationMs)` — applies a temporary discount that expires after duration. `getProductAt(id, timestamp)` — returns `{ name: string; price: number } | null` with discount applied if active at that timestamp. `scanByPrefixAt(prefix, timestamp)` — like `scanByPrefix` but reflects state at given timestamp (discounts applied/expired).
- **L4:** Backup and restore. `backup(timestamp)` — saves a snapshot of all product state, returns `number` (count of products backed up). `restore(timestamp)` — restores from the most recent backup at or before the given timestamp, returns `number` (count of products restored, or -1 if no backup found). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `compact()` — removes all but the most recent backup, returns `number` (count of backups removed).

---

## 2. Chat Messages History

**Provenance:** Reported — FinalRoundAI and LinkJob mention a chat messaging application as a reported domain. Method signatures are reconstructed.

**Summary:** Multi-room chat with message CRUD, search/filter, TTL-based expiration, and backup/restore.

- **L1:** Room and message basics. `createRoom(roomId, name)` — returns `boolean` (true if created, false if exists). `postMessage(roomId, userId, content)` — returns `number | null` (message id, auto-incrementing, or null if room doesn't exist). `getMessage(messageId)` — returns `{ userId: string; content: string } | null`. `getMessages(roomId)` — returns `Array<{ userId: string; content: string }>` sorted by message id ascending.
- **L2:** Querying and filtering. `scanMessages(roomId, prefix)` — returns messages in room whose content starts with prefix as `Array<{ messageId: number; userId: string; content: string }>` sorted by messageId. `getMessagesByUser(roomId, userId)` — returns `Array<{ messageId: number; content: string }>` sorted by messageId. `searchAllRooms(keyword)` — returns messages across all rooms containing keyword as `Array<{ roomId: string; messageId: number; content: string }>` sorted lexicographically by roomId then messageId.
- **L3:** Timestamps and TTL. `postMessageAt(roomId, userId, content, timestamp)` — posts with explicit timestamp, returns `number | null`. `setTTL(roomId, durationMs)` — messages in this room expire after duration from their timestamp. `getMessagesAt(roomId, timestamp)` — returns non-expired messages as of the given timestamp as typed array. `scanMessagesAt(roomId, prefix, timestamp)` — like `scanMessages` but only includes non-expired messages at the given timestamp.
- **L4:** Backup and restore. `backup(timestamp)` — snapshots all rooms and messages, returns `number` (total message count backed up). `restore(timestamp)` — restores from most recent backup at or before timestamp, returns `number` (message count restored, or -1 if no backup). `deleteRoom(roomId)` — removes room and all its messages, returns `number` (count of messages deleted). `listBackups()` — returns `number[]` of backup timestamps sorted ascending.

---

## 3. Booking / Reservation System

**Provenance:** Structural match — Original domain following the L1→L4 pattern. Not reported in public candidate accounts.

**Summary:** Schedule and manage reservations for resources with filtered queries, time-based expiration, and state snapshots.

- **L1:** Resource and reservation CRUD. `addResource(id, name, type)` — returns `boolean`. `createReservation(id, resourceId, startTime, endTime)` — returns `boolean` (rejects overlapping bookings for same resource). `cancelReservation(id)` — returns `boolean`. `getReservations(resourceId)` — returns `Array<{ id: string; startTime: number; endTime: number }>` sorted by startTime.
- **L2:** Querying and filtered views. `scanByType(type)` — returns resources of given type as `Array<{ id: string; name: string }>` sorted lexicographically by id. `getAvailableResources(startTime, endTime)` — returns resources with no conflicting reservations as `Array<{ id: string; name: string }>` sorted by name. `scanReservationsByPrefix(prefix)` — returns reservations whose id starts with prefix as `Array<{ id: string; resourceId: string; startTime: number; endTime: number }>` sorted by id.
- **L3:** Timestamps and auto-expiration. `createReservationAt(id, resourceId, startTime, endTime, createdAt)` — records creation timestamp, returns `boolean`. `setAutoCancel(id, durationMs)` — reservation auto-cancels if not confirmed within duration from creation. `confirmReservation(id, timestamp)` — returns `boolean` (confirms a reservation, prevents auto-cancel). `getReservationsAt(resourceId, timestamp)` — returns reservations that are active (not expired/cancelled) at the given timestamp as `Array<{ id: string; startTime: number; endTime: number }>` sorted by startTime.
- **L4:** Backup and restore. `backup(timestamp)` — snapshots all resources and reservations, returns `number` (total count of active reservations). `restore(timestamp)` — restores from most recent backup at or before timestamp, returns `number` (reservation count, or -1 if no backup). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `compact()` — removes cancelled/expired reservations from current state, returns `number` (count removed).

---

## 4. Shopping Cart / E-Commerce

**Provenance:** Structural match — Original domain following the L1→L4 pattern. Not reported in public candidate accounts.

**Summary:** Product catalog and cart management with search, time-based pricing, and order state snapshots.

- **L1:** Catalog and cart basics. `addToCatalog(id, name, price, stock)` — returns `boolean`. `addToCart(userId, productId, quantity)` — returns `boolean` (true if product exists and has stock). `removeFromCart(userId, productId)` — returns `boolean`. `getCart(userId)` — returns `Array<{ name: string; quantity: number; subtotal: number }>` sorted by name.
- **L2:** Search and filtered views. `scanCatalog(prefix)` — returns products whose names start with prefix as `Array<{ name: string; price: number }>` sorted lexicographically. `getCartsByProduct(productId)` — returns `string[]` of user ids that have this product in their cart, sorted lexicographically. `scanCatalogByPriceRange(minPrice, maxPrice)` — returns `Array<{ name: string; price: number; stock: number }>` sorted by price then name.
- **L3:** Time-aware pricing and cart expiration. `setSalePrice(productId, salePrice, timestamp, durationMs)` — temporary sale price that expires after duration. `getCartAt(userId, timestamp)` — returns cart with sale prices applied if active at that timestamp as typed array. `setCartTTL(userId, durationMs, timestamp)` — cart expires (items returned to stock) if not checked out within duration. `checkout(userId, timestamp)` — validates stock, decrements quantities, creates order, clears cart. Returns `string | null` (order id, or null if cart expired or any item out of stock).
- **L4:** Order snapshots and restore. `snapshotOrders(timestamp)` — saves current state of all orders, returns `number` (count of orders snapshotted). `restoreOrders(timestamp)` — restores from most recent snapshot at or before timestamp, returns `number` (order count, or -1 if no snapshot). `setRefundWindow(orderId, durationMs)` — refund only valid within window from checkout time. `refund(orderId, timestamp)` — returns `boolean` (true if within refund window and order exists, restores stock).

---

## 5. Kanban Board

**Provenance:** Structural match — Original domain following the L1→L4 pattern. Not reported in public candidate accounts.

**Summary:** Project management with columns and cards, filtered views, time-tracked operations, and board snapshots.

- **L1:** Board setup. `createColumn(id, name, position)` — returns `boolean`. `createCard(id, title, description)` — returns `boolean`. `moveCard(cardId, columnId)` — returns `boolean` (true if both exist). `getColumn(columnId)` — returns `Array<{ id: string; title: string }>` sorted by card id. `deleteCard(cardId)` — returns `boolean`.
- **L2:** Labels and filtering. `addLabel(cardId, label)` — returns `boolean`. `getCardsByLabel(label)` — returns `Array<{ id: string; title: string }>` for cards with this label, sorted lexicographically by id. `searchCards(query)` — returns cards whose title or description contains query as `Array<{ id: string; title: string; columnName: string }>` sorted by id. `scanCardsByPrefix(prefix)` — returns cards whose title starts with prefix as `Array<{ id: string; title: string }>` sorted lexicographically by id.
- **L3:** Timestamps and deadlines. `createCardAt(id, title, description, timestamp)` — card with creation timestamp, returns `boolean`. `setDeadline(cardId, deadlineTimestamp)` — sets a deadline on a card. `moveCardAt(cardId, columnId, timestamp)` — move with timestamp recorded, returns `boolean`. `getOverdueCards(timestamp)` — returns cards past their deadline as `Array<{ id: string; title: string; deadline: number }>` sorted by deadline ascending. `getCardAge(cardId, timestamp)` — returns `number` (milliseconds since card creation).
- **L4:** Board snapshots. `backup(timestamp)` — snapshots all columns, cards, labels, and positions, returns `number` (total card count). `restore(timestamp)` — restores from most recent backup at or before timestamp, returns `number` (card count, or -1 if no backup). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `archiveCompleted(columnId, timestamp)` — removes all cards from given column (the "done" column), returns `number` (count of cards archived).

---

## 6. Library / Media Catalog

**Provenance:** Structural match — Original domain following the L1→L4 pattern. Not reported in public candidate accounts.

**Summary:** Manage books/media with checkout tracking, search/filter, due dates with TTL, and catalog snapshots.

- **L1:** Catalog CRUD. `addItem(id, title, author, type)` — returns `boolean` (`type` is `"book"`, `"dvd"`, or `"audiobook"`). `removeItem(id)` — returns `boolean`. `getItem(id)` — returns `{ title: string; author: string } | null`. `search(query)` — matches title or author, returns `Array<{ title: string; author: string }>` sorted lexicographically by title. `listAll()` — returns `Array<{ title: string; author: string; type: string }>` sorted by title.
- **L2:** Checkouts and filtered queries. `checkout(itemId, userId)` — returns `boolean` (true if item available). `returnItem(itemId)` — returns `boolean`. `getCheckedOutBy(userId)` — returns `Array<{ title: string; author: string }>` sorted by title. `scanByType(type)` — returns available items of given type as `Array<{ id: string; title: string }>` sorted lexicographically by id. `scanByAuthorPrefix(prefix)` — returns items whose author starts with prefix as `Array<{ title: string; author: string }>` sorted lexicographically by title.
- **L3:** Due dates and TTL. `checkoutAt(itemId, userId, timestamp)` — checkout with explicit timestamp, returns `boolean`. `setLoanPeriod(itemId, durationMs)` — overrides default loan period for this item. `getOverdueItems(timestamp)` — returns items past their due date as `Array<{ title: string; userId: string; daysOverdue: number }>` sorted by daysOverdue descending. `getCheckedOutByAt(userId, timestamp)` — returns items checked out by user that haven't been returned as of the given timestamp as typed array.
- **L4:** Catalog snapshots. `backup(timestamp)` — snapshots entire catalog state (items, checkouts, loan periods), returns `number` (item count). `restore(timestamp)` — restores from most recent backup at or before timestamp, returns `number` (item count, or -1 if no backup). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `purgeReturned()` — removes checkout history for all returned items, returns `number` (count of history records purged).

---

## 7. Notification System

**Provenance:** Structural match — Original domain following the L1→L4 pattern. Not reported in public candidate accounts.

**Summary:** Multi-channel notification delivery with querying, TTL-based expiration, and state snapshots.

- **L1:** User and notification basics. `registerUser(id, name)` — returns `boolean`. `send(userId, title, body)` — returns `number | null` (notification id, or null if user doesn't exist). `getNotifications(userId)` — returns `Array<{ title: string; body: string }>` sorted by most recent first. `markRead(userId, notificationId)` — returns `boolean` (true if notification existed and was unread). `getUnreadCount(userId)` — returns `number`.
- **L2:** Channels and filtering. `setChannel(userId, channel, enabled)` — channel is `"email"`, `"sms"`, or `"push"`. Returns `boolean`. `sendToChannel(userId, title, body, channel)` — returns `number | null` (notification id, or null if channel disabled). `scanByPrefix(userId, prefix)` — returns notifications whose title starts with prefix as `Array<{ id: number; title: string }>` sorted lexicographically by title. `getNotificationsByChannel(userId, channel)` — returns `Array<{ id: number; title: string; body: string }>` sorted by id descending.
- **L3:** Timestamps and TTL. `sendAt(userId, title, body, timestamp)` — sends with explicit timestamp, returns `number | null`. `setTTL(userId, durationMs)` — notifications for this user expire after duration. `getNotificationsAt(userId, timestamp)` — returns non-expired notifications as of timestamp as typed array. `getUnreadCountAt(userId, timestamp)` — returns `number` (count of non-expired unread notifications at given time).
- **L4:** Backup and restore. `backup(timestamp)` — snapshots all user state and notifications, returns `number` (total notification count). `restore(timestamp)` — restores from most recent backup at or before timestamp, returns `number` (notification count, or -1 if no backup). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `purgeExpired(timestamp)` — permanently removes notifications that have expired as of the given timestamp, returns `number` (count removed).

---

## 8. Quiz / Assessment Engine

**Provenance:** Structural match — Original domain following the L1→L4 pattern. Not reported in public candidate accounts.

**Summary:** Create and administer quizzes with attempts, time limits, and state snapshots.

- **L1:** Quiz and question CRUD. `createQuiz(id, title)` — returns `boolean`. `addQuestion(quizId, questionId, text, options, correctIndex)` — returns `boolean` (true if quiz exists and question id is unique). `getQuiz(quizId)` — returns `{ title: string; questionCount: number } | null`. `getQuestions(quizId)` — returns `Array<{ questionId: string; text: string }>` sorted by questionId. `deleteQuestion(quizId, questionId)` — returns `boolean`.
- **L2:** Taking quizzes and querying. `startAttempt(userId, quizId)` — returns `string | null` (attemptId, or null if quiz doesn't exist or user has attempt in progress). `submitAnswer(attemptId, questionId, selectedIndex)` — returns `boolean`. `finishAttempt(attemptId)` — returns `{ correct: number; total: number; percentage: number }`. `scanAttemptsByPrefix(prefix)` — returns attempts whose id starts with prefix as `Array<{ attemptId: string; userId: string; quizTitle: string }>` sorted lexicographically by attemptId.
- **L3:** Time limits and timestamps. `startAttemptAt(userId, quizId, timestamp)` — starts attempt with explicit timestamp, returns `string | null`. `setTimeLimit(quizId, durationMs)` — attempts auto-expire after duration. `submitAnswerAt(attemptId, questionId, selectedIndex, timestamp)` — returns `boolean` (rejects if attempt expired at given timestamp). `finishAttemptAt(attemptId, timestamp)` — returns `{ correct: number; total: number; percentage: number } | null` (null if expired). `getActiveAttempts(timestamp)` — returns non-expired in-progress attempts as `Array<{ attemptId: string; userId: string; quizTitle: string }>` sorted lexicographically by attemptId.
- **L4:** State snapshots. `backup(timestamp)` — snapshots all quizzes, questions, and attempts, returns `number` (total quiz count). `restore(timestamp)` — restores from most recent backup at or before timestamp, returns `number` (quiz count, or -1 if no backup). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `resetQuizAttempts(quizId)` — clears all attempts for a quiz, returns `number` (count of attempts cleared).

---

## 9. In-Memory Database

**Provenance:** Reported — The most widely documented Anthropic CodeSignal domain. Described in detail by aonecode, Lodely, LinkJob, Blind, and multiple candidate accounts. The L1→L4 progression (CRUD → scan/filter → TTL → backup/restore) is confirmed across sources. Method signatures are reconstructed from candidate reports — the actual assessment may use different names or parameters.

**Summary:** Key-value store with CRUD, prefix scanning, TTL, and backup/restore.

- **L1:** Basic key-value operations. `set(key, value)` — sets a key-value pair, returns `boolean` (true if new key, false if overwritten). `get(key)` — returns `string | null` (the value, or null if key doesn't exist). `delete(key)` — returns `boolean` (true if key existed). `keys()` — returns `string[]` sorted lexicographically.
- **L2:** Scanning and querying. `scan(prefix)` — returns key-value pairs where key starts with prefix as `Array<{ key: string; value: string }>` sorted lexicographically by key. `scanByValuePrefix(prefix)` — returns pairs where value starts with prefix as `Array<{ key: string; value: string }>` sorted lexicographically by key. `count()` — returns `number` (total number of keys). `getRange(startKey, endKey)` — returns pairs where key is lexicographically between start (inclusive) and end (exclusive) as `Array<{ key: string; value: string }>` sorted by key.
- **L3:** Timestamps and TTL. `setAt(key, value, timestamp)` — sets with explicit timestamp, returns `boolean`. `setAtWithTTL(key, value, timestamp, ttlMs)` — sets with TTL that expires after ttlMs from timestamp. `getAt(key, timestamp)` — returns `string | null` (value if key exists and hasn't expired at the given timestamp). `scanAt(prefix, timestamp)` — like `scan` but only returns non-expired keys as of the given timestamp. `deleteAt(key, timestamp)` — deletes at the given timestamp, returns `boolean` (true if key existed and wasn't expired).
- **L4:** Backup and restore. `backup(timestamp)` — saves a snapshot of all key-value state (including TTLs), returns `number` (count of live non-expired keys at that timestamp). `restore(timestamp)` — restores from the most recent backup taken at or before the given timestamp, returns `number` (key count, or -1 if no backup found). `listBackups()` — returns `number[]` of backup timestamps sorted ascending. `compact(timestamp)` — permanently removes all expired keys as of the given timestamp, returns `number` (count of keys removed).

---

## Design Notes

When generating from this bank:

1. **Flesh out the types.** The descriptions above are summaries. The generated interface should have complete type signatures, return types, and edge case documentation.

2. **Add edge case tests** beyond what's described. Every level should test: empty state, nonexistent ids, duplicate operations, interaction with delete, and sorted output.

3. **Ensure L1 tests pass at L4.** The data model grows but never breaks backward compatibility. This is the core constraint of the progressive format.

4. **Use idiomatic TypeScript return types.** Methods should return `boolean`, `string | null`, typed arrays, or small interfaces -- not formatted strings or stringified booleans. Define type aliases where useful (e.g., `type KeyValue = { key: string; value: string }`). The generated code should feel like real TypeScript.

5. **L3 methods should be variants of L1-L2 methods.** The `At` suffix pattern (e.g., `getAt`, `scanAt`, `setAtWithTTL`) is the canonical way to add time-awareness without breaking backward compatibility. L1-L2 methods still work as before (implicitly using "current time").

6. **L4 backup/restore is the canonical pattern.** Every domain's L4 should include `backup(timestamp)`, `restore(timestamp)`, and `listBackups()` at minimum. Additional L4 operations (compact, purge, archive) are domain-specific.

7. **Invent new domains freely.** The bank above is a starting point, not an exhaustive list. Any domain that maps to CRUD -> scan/filter -> timestamps/TTL -> backup/restore works. Examples: DNS resolver cache, task scheduler, file system, session store, feature flag service.
