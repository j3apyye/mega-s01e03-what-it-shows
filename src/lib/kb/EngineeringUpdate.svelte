<script>
  import update from '#lib/data/engineering-update.json';
</script>

<p>The <a href={update.source}>course engineering update</a> reports source ticket
  #{update.ticket} closed <strong>{update.closedAsShown}</strong>.</p>
<table>
  <thead><tr><th>cause</th><th>reported outcome</th><th>engineering detail</th></tr></thead>
  <tbody>
    {#each ['parser', 'hint'] as cause}
      <tr><td>{cause}</td><td>{update[cause].status}</td><td>{update[cause].detail}</td></tr>
    {/each}
  </tbody>
</table>
