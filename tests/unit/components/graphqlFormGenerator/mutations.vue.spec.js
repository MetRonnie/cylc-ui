import { associate } from '@/views/Mutations'
import { expect } from 'chai'

const fooMutation = {
  name: 'foo',
  args: [
    {
      name: 'a',
      type: {
        name: 'FOO',
        kind: 'INPUT_OBJECT'
      }
    },
    {
      name: 'b',
      type: {
        name: 'String',
        kind: 'SCALAR'
      }
    }
  ]
}

const fooListMutation = {
  name: 'foo',
  args: [
    {
      // List<Foo>
      name: 'a',
      type: {
        name: null,
        kind: 'LIST',
        ofType: {
          name: 'FOO',
          kind: 'INPUT_OBJECT'
        }
      }
    }
  ]
}

const fooNestedMutation = {
  name: 'foo',
  args: [
    {
      // NonNull<List<NonNull<Foo>>>
      name: 'a',
      type: {
        name: null,
        kind: 'NON_NULL',
        ofType: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: null,
            kind: 'NON_NULL',
            ofType: {
              name: 'FOO',
              kinda: 'INPUT_OBJECT'
            }
          }
        }
      }
    }
  ]
}

const objects = {
  foo: [['FOO', false]],
  bar: [['BAR', false], ['BARS', true]]
}

// okay so it's a view not a compoent of formgenerator, this functionality
// will get collected and tidied in a future PR
describe('Mutations Component', () => {
  it('should associate mutations with objects', () => {
    expect(
      associate([fooMutation], objects)
    ).to.deep.equal({
      foo: [
        {
          argument: 'a',
          cylcObject: 'foo',
          multiple: false
        }
      ]
    })
  })

  it('should detect when a field is used in a collection', () => {
    expect(
      associate([fooListMutation], objects)
    ).to.deep.equal({
      foo: [
        {
          argument: 'a',
          cylcObject: 'foo',
          multiple: true
        }
      ]
    })
  })

  it('should detect fields in nested structures', () => {
    expect(
      associate([fooNestedMutation], objects)
    ).to.deep.equal({
      foo: [
        {
          argument: 'a',
          cylcObject: 'foo',
          multiple: true
        }
      ]
    })
  })
})
