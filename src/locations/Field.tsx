import React from 'react';
import {GlobalStyles, Paragraph,TextLink, EntryCard, Card, MenuItem } from '@contentful/f36-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { useCMA,useSDK } from '@contentful/react-apps-toolkit';
import { MultipleEntryReferenceEditor,  } from '@contentful/field-editor-reference';

const Field = () => {
  const sdk = useSDK<FieldExtensionSDK>();
  const cma = useCMA()
  
  sdk.window.startAutoResizer();
  sdk.window.updateHeight(300)
  
  async function removeEntry(event:any, param:any) {
    let fieldCurrentValue = await sdk.field.getValue()//sdk.entry.fields.referencesField.getValue()
    fieldCurrentValue.splice(param.index,1)
    await sdk.field.setValue(fieldCurrentValue)
  }
  
  async function  duplicateEntry(event:any, param:any){
    let entry = await cma.entry.get({entryId:param.entity.sys.id});
    let {fields} = entry
    let result = await cma.entry.create({contentTypeId:param.contentType.sys.id},{fields})
    
    //reference new entry
    let fieldCurrentValue = await sdk.field.getValue()
    
    fieldCurrentValue.push({
      sys:{
        id:result.sys.id,
        linkType:"Entry",
        type:"Link"
      }
    })
    
    await sdk.field.setValue(fieldCurrentValue)
  }
  
  function openEntry(props: any) {
    sdk.navigator.openEntry(props.entity?.sys?.id, {slideIn: true})
  }

  function entryStatus(props: any) {
    return (!!props.entity.sys.publishedAt && props.entity.sys.publishedAt !== props.entity.sys.updatedAt) ? 'changed' : (
      !!props.entity.sys.publishedAt ? 'published' : 'draft'
    )
  }

  function entryTitle(props: any) {
    return (!!props.entity.fields[props.contentType.displayField] ? props.entity.fields[props.contentType.displayField][props.defaultLocaleCode] : "Untitled" )
  }
  
  function renderEntryCard(props:any){
    return (
      <EntryCard
        status={entryStatus(props)}
        contentType={props.contentType?.name}
        title={entryTitle(props)}
        description="Description"
        actions={[
          <MenuItem key="Open Entry" onClick={() => openEntry(props)}>
            Open Entry
          </MenuItem>,
          <MenuItem key="Duplicate Entry" onClick={(event: any) => duplicateEntry(event,props )}>
          Duplicate Entry
          </MenuItem>,
          <MenuItem key="Remove" onClick={(event: any) => removeEntry(event,props )}>
          Remove
          </MenuItem>,
        ]}
      />)
    }
    
    return <>
     <GlobalStyles/>
      <MultipleEntryReferenceEditor 
        
        sdk={sdk}
        viewType="card"
        isInitiallyDisabled={false}
        hasCardEditActions={true}
        hasCardMoveActions={true}
        parameters={{
          instance: {
            showCreateEntityAction: true,
            showLinkEntityAction: true
          },
        }}
        renderCustomCard={renderEntryCard}
      />
    </>
  };
  
  export default Field;
  