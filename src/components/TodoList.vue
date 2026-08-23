<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const nextId = ref(5)
const newTitle = ref('')
const newDeadline = ref('')
const newPriority = ref('中')
const toastMessage = ref('')
const pendingDeleteId = ref(null)
let toastTimer = null

const tasks = ref([
  {
    id: 1,
    title: '准备周会要点',
    priority: '高',
    tag: '工作',
    deadline: '2026-02-12',
    completed: false,
  },
  {
    id: 2,
    title: '买咖啡豆',
    priority: '低',
    tag: '生活',
    deadline: '2026-02-10',
    completed: false,
  },
  {
    id: 3,
    title: '重构目录结构（示例）',
    priority: '中',
    tag: '项目',
    deadline: '',
    completed: true,
  },
  {
    id: 4,
    title: '阅读 30 分钟',
    priority: '中',
    tag: '自我提升',
    deadline: '',
    completed: false,
  },
])

const totalCount = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter((t) => t.completed).length)
const activeCount = computed(() => totalCount.value - completedCount.value)

const lastUpdated = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

function priorityClass(priority) {
  if (priority === '高') return 'high'
  if (priority === '低') return 'low'
  return 'medium'
}

function taskMeta(task) {
  const left = task.completed
    ? '已完成'
    : task.deadline
      ? `截止: ${task.deadline}`
      : '无截止日期'
  return `${left} • 标签: ${task.tag}`
}

function resetForm() {
  newTitle.value = ''
  newDeadline.value = ''
  newPriority.value = '中'
}

function addTask() {
  const title = newTitle.value.trim()
  if (!title) return

  tasks.value.unshift({
    id: nextId.value++,
    title,
    priority: newPriority.value,
    tag: '未分类',
    deadline: newDeadline.value,
    completed: false,
  })
  resetForm()
}

function showToast(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2500)
}

function deleteTask(id) {
  const task = tasks.value.find((item) => item.id === id)
  if (!task) return

  tasks.value = tasks.value.filter((item) => item.id !== id)
  showToast(`已删除：${task.title}`)
}

function askDeleteTask(id) {
  pendingDeleteId.value = id
}

function cancelDelete() {
  pendingDeleteId.value = null
}

function confirmDelete() {
  const id = pendingDeleteId.value
  pendingDeleteId.value = null
  if (id == null) return
  deleteTask(id)
}

function onDocumentClick(event) {
  if (pendingDeleteId.value == null) return
  const wrap = event.target.closest?.('.delete-wrap')
  if (!wrap) cancelDelete()
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape' && pendingDeleteId.value != null) {
    event.preventDefault()
    cancelDelete()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onUnmounted(() => {
  clearTimeout(toastTimer)
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

function onFormKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTask()
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    resetForm()
  }
}
</script>

<template>
  <div class="todo-page">
    <!-- 顶部标题栏 -->
    <header class="page-header">
      <div class="header-left">
        <div class="header-icon"></div>
        <div class="header-text">
          <h1 class="page-title">To-Do List</h1>
          <p class="page-subtitle">静态页面结构与样式预览</p>
        </div>
      </div>
      <div class="header-stats">
        <span class="stat-pill">全部 {{ totalCount }}</span>
        <span class="stat-pill">未完成 {{ activeCount }}</span>
        <span class="stat-pill">已完成 {{ completedCount }}</span>
      </div>
    </header>

    <!-- 双栏主内容 -->
    <div class="main-grid">
      <!-- 左栏：新增任务 -->
      <section class="panel panel-form" @keydown="onFormKeydown">
        <div class="panel-header">
          <h2 class="panel-title">新增任务</h2>
          <span class="panel-hint">填写后点击添加，或按 Enter</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="task-title">任务内容</label>
          <input
            id="task-title"
            v-model="newTitle"
            type="text"
            class="form-input"
            placeholder="例如：整理本周计划"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="task-deadline">截止日期</label>
          <input
            id="task-deadline"
            v-model="newDeadline"
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="task-priority">优先级</label>
          <select id="task-priority" v-model="newPriority" class="form-select">
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>

        <button class="btn-add" type="button" @click="addTask">添加</button>
      </section>

      <!-- 右栏：任务列表 -->
      <section class="panel panel-list">
        <div class="panel-header">
          <h2 class="panel-title">任务列表</h2>
          <span class="panel-hint">筛选与编辑仍为静态展示，可删除任务</span>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-group">
            <button class="filter-btn active" type="button" disabled>全部</button>
            <button class="filter-btn" type="button" disabled>未完成</button>
            <button class="filter-btn" type="button" disabled>已完成</button>
          </div>
          <button class="filter-clear" type="button" disabled>清空已完成</button>
        </div>

        <!-- 搜索与排序 -->
        <div class="search-bar">
          <div class="search-input-wrap">
            <svg class="search-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0 4.499 4.499 0 0 0 8.997 0Z"
              />
            </svg>
            <input type="text" class="search-input" placeholder="搜索任务..." disabled />
          </div>
          <div class="sort-select" aria-disabled="true">
            <span>排序 创建时间</span>
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"
              />
            </svg>
          </div>
        </div>

        <!-- 任务列表 -->
        <ul class="task-list">
          <li
            v-for="task in tasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <label class="task-checkbox">
              <input type="checkbox" :checked="task.completed" disabled />
              <span class="checkbox-box"></span>
            </label>
            <div class="task-content">
              <div class="task-title-row">
                <span class="task-title">{{ task.title }}</span>
                <span class="priority-badge" :class="priorityClass(task.priority)">{{
                  task.priority
                }}</span>
              </div>
              <p class="task-meta">{{ taskMeta(task) }}</p>
            </div>
            <div class="task-actions">
              <button class="action-btn" type="button" aria-label="编辑" disabled>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M11.013 1.513a1.75 1.75 0 0 1 2.475 2.475L5.17 12.277a.75.75 0 0 1-.353.212l-3.006.893a.25.25 0 0 1-.316-.316l.893-3.006a.75.75 0 0 1 .212-.353L11.013 1.513Z"
                  />
                </svg>
              </button>
              <div class="delete-wrap">
                <button
                  class="action-btn action-btn-delete"
                  type="button"
                  aria-label="删除"
                  @click.stop="askDeleteTask(task.id)"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.75 1.75 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 0 1 1.492-.15ZM6.5 6.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Zm2.25 0a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z"
                    />
                  </svg>
                </button>
                <div
                  v-if="pendingDeleteId === task.id"
                  class="delete-bubble"
                  role="dialog"
                  aria-label="确认删除"
                  @click.stop
                >
                  <p class="delete-bubble-text">确定删除「{{ task.title }}」？</p>
                  <div class="delete-bubble-actions">
                    <button class="bubble-btn bubble-btn-cancel" type="button" @click="cancelDelete">
                      取消
                    </button>
                    <button class="bubble-btn bubble-btn-confirm" type="button" @click="confirmDelete">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li v-if="!tasks.length" class="task-empty">暂无任务</li>
        </ul>

        <!-- 底部快捷键提示 -->
        <footer class="panel-footer">
          <div class="shortcut-hints">
            <span class="shortcut-key">Enter 添加</span>
            <span class="shortcut-sep">•</span>
            <span class="shortcut-key">Esc 取消</span>
          </div>
          <span class="last-updated">最后更新: {{ lastUpdated }}</span>
        </footer>
      </section>
    </div>

    <div v-if="toastMessage" class="toast" role="status">{{ toastMessage }}</div>
  </div>
</template>

<style scoped>
.todo-page {
  max-width: 1100px;
  margin: 0 auto;
}

/* ===== 顶部标题栏 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2dd4bf 0%, #6366f1 100%);
  flex-shrink: 0;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #f0eef8;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: #9b93b8;
  margin-top: 2px;
}

.header-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-pill {
  padding: 6px 14px;
  font-size: 13px;
  color: #c4bdd8;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(8px);
}

/* ===== 双栏布局 ===== */
.main-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 860px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== 玻璃面板 ===== */
.panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
}

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #f0eef8;
}

.panel-hint {
  font-size: 11px;
  color: #7a7294;
}

/* ===== 左栏表单 ===== */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #9b93b8;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: #e8e6f0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  outline: none;
  color-scheme: dark;
}

.form-input::placeholder {
  color: #6b6380;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%237a7294' d='M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 32px;
  cursor: pointer;
}

.form-select option {
  color: #1e1640;
  background: #f0eef8;
}

.btn-add {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #0f0a1a;
  background: linear-gradient(90deg, #2dd4bf 0%, #38bdf8 50%, #818cf8 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.btn-add:hover {
  opacity: 0.92;
}

/* ===== 右栏筛选 ===== */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-group {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 3px;
}

.filter-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: #9b93b8;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: default;
}

.filter-btn.active {
  color: #f0eef8;
  background: rgba(255, 255, 255, 0.12);
}

.filter-clear {
  padding: 6px 14px;
  font-size: 13px;
  color: #9b93b8;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  cursor: default;
}

/* ===== 搜索栏 ===== */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.search-icon {
  color: #6b6380;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 10px 0;
  font-size: 13px;
  color: #c4bdd8;
  background: transparent;
  border: none;
  outline: none;
  cursor: default;
}

.search-input::placeholder {
  color: #6b6380;
}

.sort-select {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #9b93b8;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  white-space: nowrap;
  cursor: default;
  flex-shrink: 0;
}

.sort-select svg {
  color: #7a7294;
}

/* ===== 任务列表 ===== */
.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

.task-item.completed {
  opacity: 0.65;
}

/* 复选框 */
.task-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: default;
}

.task-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 5px;
  transition: all 0.15s;
}

.task-item.completed .checkbox-box {
  background: #2dd4bf;
  border-color: #2dd4bf;
}

.task-item.completed .checkbox-box::after {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f0a1a;
  font-size: 11px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
}

/* 任务内容 */
.task-content {
  flex: 1;
  min-width: 0;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #f0eef8;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #9b93b8;
}

.task-meta {
  font-size: 12px;
  color: #7a7294;
  margin-top: 4px;
}

/* 优先级徽章 */
.priority-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  flex-shrink: 0;
}

.priority-badge.high {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority-badge.medium {
  color: #fde047;
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.priority-badge.low {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* 操作按钮 */
.task-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #7a7294;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: default;
}

.action-btn-delete {
  cursor: pointer;
}

.action-btn-delete:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
}

.delete-wrap {
  position: relative;
}

.delete-bubble {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 228px;
  padding: 12px;
  background: rgba(32, 26, 52, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  z-index: 8;
}

.delete-bubble::after {
  content: '';
  position: absolute;
  right: 10px;
  bottom: -6px;
  width: 10px;
  height: 10px;
  background: rgba(32, 26, 52, 0.96);
  border-right: 1px solid rgba(255, 255, 255, 0.16);
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  transform: rotate(45deg);
}

.delete-bubble-text {
  font-size: 13px;
  line-height: 1.45;
  color: #f0eef8;
  margin-bottom: 10px;
  word-break: break-word;
}

.delete-bubble-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.bubble-btn {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
}

.bubble-btn-cancel {
  color: #d8d0ea;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.bubble-btn-confirm {
  color: #fff;
  background: rgba(239, 68, 68, 0.85);
  border: 1px solid rgba(239, 68, 68, 0.95);
}

.task-empty {
  padding: 28px 16px;
  text-align: center;
  font-size: 13px;
  color: #7a7294;
  background: rgba(0, 0, 0, 0.15);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

/* ===== 底部栏 ===== */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
  gap: 8px;
}

.shortcut-hints {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.shortcut-key {
  font-size: 12px;
  color: #9b93b8;
}

.shortcut-sep {
  color: #4a4460;
  font-size: 12px;
}

.last-updated {
  font-size: 12px;
  color: #6b6380;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  padding: 10px 18px;
  font-size: 13px;
  color: #f0eef8;
  background: rgba(28, 22, 48, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  z-index: 20;
  max-width: min(520px, calc(100% - 32px));
  text-align: center;
}
</style>
