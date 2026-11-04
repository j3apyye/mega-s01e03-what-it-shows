<script lang="ts">
  import { exceptions, assignedCause } from '#lib/kb/audit';
</script>

<p><strong>{exceptions.length}</strong> reports are listed in the desk's <code>oneDayMove</code> notes.
  They remain included in their assigned cause's count; they are not extra reports.</p>
<table>
  <thead><tr><th>report</th><th>tenant / channel</th><th>reporter's words</th><th>assigned cause</th></tr></thead>
  <tbody>
    {#each exceptions as r (r.id)}
      <tr><td><code>{r.id}</code></td><td>{r.tenant} / {r.channel}</td><td>{r.body}</td><td>{assignedCause(r)}</td></tr>
    {/each}
  </tbody>
</table>
