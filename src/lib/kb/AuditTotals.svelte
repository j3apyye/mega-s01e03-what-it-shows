<script lang="ts">
  import { exported, unique, merged, groups, intakeDisagreements, receivedDays, mergeDays } from '#lib/kb/audit';
</script>

<p><strong>{exported.length}</strong> exported rows → <strong>{unique.length}</strong> unique report IDs;
  <strong>{exported.length - unique.length}</strong> repeated overlap rows do not add reports.
  All <strong>{merged.length}</strong> unique reports were merged into #4471.</p>
<p>The supplied classifier assigns <strong>{groups.length}</strong> causes.
  Intake tags disagree with that classifier for <strong>{intakeDisagreements.length}</strong> reports.</p>
<p>Reports arrived from <strong>{receivedDays[0]}</strong> through <strong>{receivedDays.at(-1)}</strong>.
  The largest merge day was <strong>{mergeDays[0].day}</strong>:
  <strong>{mergeDays[0].count}</strong> unique reports were merged that day.</p>
