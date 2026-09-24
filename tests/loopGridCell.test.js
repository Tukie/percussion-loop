import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, ref } from 'vue'

async function loadLoopGridCell() {
  const source = readFileSync(
    new URL('../src/components/LoopGridCell.vue', import.meta.url),
    'utf8',
  )
  const { descriptor } = parse(source)
  const compiled = compileScript(descriptor, { id: 'loop-grid-cell', inlineTemplate: true })
  // Ordering mode never renders LoopItem; avoid compiling the unrelated component.
  const moduleSource = compiled.content
    .replaceAll(/from ['"]vue['"]/g, `from '${import.meta.resolve('vue')}'`)
    .replace("import LoopItem from '@/components/LoopItem.vue'", 'const LoopItem = {}')
  return (await import(`data:text/javascript,${encodeURIComponent(moduleSource)}`)).default
}

function createHost() {
  const makeNode = (type, text = '') => ({ type, text, props: {}, children: [], parent: null })
  const renderer = createRenderer({
    createElement: (type) => makeNode(type),
    createText: (text) => makeNode('#text', text),
    createComment: (text) => makeNode('#comment', text),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
      node.children = []
    },
    patchProp: (node, key, _previous, value) => {
      node.props[key] = value
      if (key === 'checked') node.checked = Boolean(value)
    },
    insert: (node, parent, anchor = null) => {
      if (node.parent) {
        const previousIndex = node.parent.children.indexOf(node)
        if (previousIndex !== -1) node.parent.children.splice(previousIndex, 1)
      }
      const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1
      parent.children.splice(anchorIndex === -1 ? parent.children.length : anchorIndex, 0, node)
      node.parent = parent
    },
    remove: (node) => {
      const index = node.parent?.children.indexOf(node) ?? -1
      if (index !== -1) node.parent.children.splice(index, 1)
      node.parent = null
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  })
  return { renderer, root: makeNode('root') }
}

function findCheckboxes(node) {
  return [
    ...(node.type === 'input' && node.props.type === 'checkbox' ? [node] : []),
    ...node.children.flatMap(findCheckboxes),
  ]
}

test('only the selected loop checkbox is checked after swapping slots', async () => {
  const LoopGridCell = await loadLoopGridCell()
  const slots = ref([
    { id: 'sequence-a', name: 'A', color: '#ffffff' },
    { id: 'sequence-b', name: 'B', color: '#ffffff' },
  ])
  const selectedLoopId = ref(null)
  const { renderer, root } = createHost()
  const app = renderer.createApp({
    render: () =>
      h(
        'div',
        slots.value.map((sequence, position) =>
          h(LoopGridCell, {
            key: position,
            position,
            sequence,
            ordering: true,
            selectedLoopId: selectedLoopId.value,
            onSelectLoop: (id) => {
              selectedLoopId.value = selectedLoopId.value === id ? null : id
            },
            onPlaceSequence: (target) => {
              const source = slots.value.findIndex((item) => item.id === selectedLoopId.value)
              const updated = [...slots.value]
              ;[updated[source], updated[target]] = [updated[target], updated[source]]
              slots.value = updated
              selectedLoopId.value = null
            },
          }),
        ),
      ),
  })
  app.mount(root)

  const clickCheckbox = async (position) => {
    const checkbox = findCheckboxes(root)[position]
    // Browsers toggle checked before dispatching change.
    checkbox.checked = !checkbox.checked
    checkbox.props.onChange()
    await nextTick()
  }

  await clickCheckbox(0)
  assert.deepEqual(
    findCheckboxes(root).map((checkbox) => checkbox.checked),
    [true, false],
  )
  await clickCheckbox(1)
  const checkedAfterSwap = findCheckboxes(root).map((checkbox) => checkbox.checked)
  await clickCheckbox(0)
  assert.deepEqual(
    findCheckboxes(root).map((checkbox) => checkbox.checked),
    [true, false],
  )
  assert.deepEqual(checkedAfterSwap, [false, false])
})
