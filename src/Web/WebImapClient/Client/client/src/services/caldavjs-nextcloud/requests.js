let requests = {};

requests.listEvents = function (args) {
  let filter = (args.start !== null && args.end !== null) ? `
  <c:comp-filter name="VCALENDAR">
    <c:comp-filter name="VEVENT">
      <c:time-range start="${args.start}" end="${args.end}" />
    </c:comp-filter>
  </c:comp-filter>` : `<c:comp-filter name="VCALENDAR" />`;
  return `
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:prop>
        <d:getetag />
        <c:calendar-data />
    </d:prop>
    <c:filter>
      ${filter}
    </c:filter>
</c:calendar-query>
  `.trim();
}

requests.createCalendar = function (args) {
  return `
   <?xml version="1.0" encoding="utf-8" ?>
   <C:mkcalendar xmlns:D="DAV:"
                 xmlns:C="urn:ietf:params:xml:ns:caldav"
                 xmlns:E="http://apple.com/ns/ical/">
     <D:set>
       <D:prop>
         <D:displayname>${args.name}</D:displayname>
         <E:calendar-color>${args.color}</E:calendar-color>
         <C:calendar-description xml:lang="en">${args.description}</C:calendar-description>
         <C:supported-calendar-component-set>
           <C:comp name="VEVENT"/>
         </C:supported-calendar-component-set>
         <C:calendar-timezone><![CDATA[${args.data}]]></C:calendar-timezone>
       </D:prop>
     </D:set>
   </C:mkcalendar>
  `.trim();
}

requests.updateCalendar = function (args) {
  return `
   <?xml version="1.0" encoding="utf-8" ?>
    <d:propertyupdate xmlns:d="DAV:"
    xmlns:c="urn:ietf:params:xml:ns:caldav"
    xmlns:e="http://apple.com/ns/ical/">
      <d:set>
        <d:prop>
          <d:displayname>${args.name}</d:displayname>
          <e:calendar-color>${args.color}</e:calendar-color>
          <c:calendar-description xml:lang="en">${args.description}</c:calendar-description>
        </d:prop>
      </d:set>
    </d:propertyupdate>
  `.trim();
}

requests.principal = function (args) {
  return `
<d:propfind xmlns:d="DAV:">
  <d:prop>
     <d:current-user-principal />
  </d:prop>
</d:propfind>
  `.trim();
}

requests.calendarHome = function (args) {
  return `
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
     <c:calendar-home-set />
  </d:prop>
</d:propfind>
  `.trim();
}

requests.calendarList = function (args) {
  return `
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/" 
xmlns:c="urn:ietf:params:xml:ns:caldav"
xmlns:e="http://apple.com/ns/ical/">
  <d:prop>
     <d:resourcetype />
     <d:displayname />
     <e:calendar-color />
     <c:calendar-description />
     <cs:getctag />
     <d:sync-token />
     <c:supported-calendar-component-set />
  </d:prop>
</d:propfind>
  `.trim();
}

requests.getChanges = function (args) {
  return `
<?xml version="1.0" encoding="utf-8" ?>
<d:sync-collection xmlns:d="DAV:">
  <d:sync-token>${args.syncToken}</d:sync-token>
  <d:sync-level>1</d:sync-level>
  <d:prop>
    <d:getetag/>
  </d:prop>
</d:sync-collection>
  `.trim();
}

requests.addressbooks = function (args) {
  return `
<d:propfind 
xmlns:d="DAV:" 
xmlns:cs="http://calendarserver.org/ns/"
xmlns:card="urn:ietf:params:xml:ns:carddav">
  <d:prop>
     <d:displayname />
     <cs:getctag />
  </d:prop>
</d:propfind>
  `.trim();
}

requests.contacts = function (args) {
  return `
  <card:addressbook-query xmlns:d="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
  <d:prop>
      <d:getetag />
      <card:address-data />
  </d:prop>
</card:addressbook-query>
  `.trim();
}



export default requests;