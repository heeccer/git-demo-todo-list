import { afterEach, describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TodoList from '@/components/TodoList.vue'

describe('TodoList', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('渲染初始任务并显示统计', () => {
    const wrapper = mount(TodoList)

    expect(wrapper.findAll('.task-item')).toHaveLength(4)
    expect(wrapper.text()).toContain('全部 4')
    expect(wrapper.text()).toContain('未完成 3')
    expect(wrapper.text()).toContain('已完成 1')
    expect(wrapper.text()).toContain('准备周会要点')
  })

  it('填写内容后点击添加会插入新任务', async () => {
    const wrapper = mount(TodoList)

    await wrapper.find('#task-title').setValue('写单元测试')
    await wrapper.find('#task-deadline').setValue('2026-09-07')
    await wrapper.find('#task-priority').setValue('高')
    await wrapper.find('.btn-add').trigger('click')

    expect(wrapper.findAll('.task-item')).toHaveLength(5)
    expect(wrapper.text()).toContain('写单元测试')
    expect(wrapper.text()).toContain('全部 5')
    expect(wrapper.find('#task-title').element.value).toBe('')
  })

  it('空标题不会新增任务', async () => {
    const wrapper = mount(TodoList)

    await wrapper.find('#task-title').setValue('   ')
    await wrapper.find('.btn-add').trigger('click')

    expect(wrapper.findAll('.task-item')).toHaveLength(4)
  })

  it('确认删除后移除任务并显示 toast', async () => {
    const wrapper = mount(TodoList)

    await wrapper.findAll('[aria-label="删除"]')[0].trigger('click')
    expect(wrapper.find('[aria-label="确认删除"]').exists()).toBe(true)

    await wrapper.find('.bubble-btn-confirm').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.task-item')).toHaveLength(3)
    expect(wrapper.find('.toast').text()).toContain('已删除：准备周会要点')
    expect(wrapper.text()).toContain('全部 3')
  })

  it('取消删除会关闭确认框且不删任务', async () => {
    const wrapper = mount(TodoList)

    await wrapper.findAll('[aria-label="删除"]')[0].trigger('click')
    await wrapper.find('.bubble-btn-cancel').trigger('click')

    expect(wrapper.find('[aria-label="确认删除"]').exists()).toBe(false)
    expect(wrapper.findAll('.task-item')).toHaveLength(4)
  })
})
