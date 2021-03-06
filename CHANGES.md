# Selected Cylc UI Changes

Internal changes that do not directly affect users may not be listed here.  For
all changes see the [closed
milestones](https://github.com/cylc/cylc-ui/milestones?state=closed) for each
release.

-------------------------------------------------------------------------------
## __cylc-ui-0.2 (2019-??-??)__

Release 0.2 of Cylc UI.

### Backward incompatible changes

None or N/A.

### Enhancements

[#266](https://github.com/cylc/cylc-ui/pull/266) - Color cylc logo.

[#257](https://github.com/cylc/cylc-ui/pull/257) - Display toolbar for
workflows only.

[#283](https://github.com/cylc/cylc-ui/pull/283) - Load user information
on application startup.

[#285](https://github.com/cylc/cylc-ui/pull/285) - Update Vuetify to 2.1,
along with other dependencies with updates available.

[#291](https://github.com/cylc/cylc-ui/pull/291) - Add families to Tree
view and component.

[#301](https://github.com/cylc/cylc-ui/pull/301) - Add GScan component.

[#327](https://github.com/cylc/cylc-ui/pull/301) - Use live data for the
dashboard workflows summary.

[#307](https://github.com/cylc/cylc-ui/pull/307) - Invoke mutations to
hold, release, and stop workflows.

[#280](https://github.com/cylc/cylc-ui/pull/280) - Add WebSockets client
for GraphQL subscriptions.

[#325](https://github.com/cylc/cylc-ui/pull/325) - Create Workflow
component with Lumino.

[#355](https://github.com/cylc/cylc-ui/pull/355) - Use wss when page
protocol is http:

[#379](https://github.com/cylc/cylc-ui/pull/379) - Add ConnectionStatus
component.

### Fixes

[#275](https://github.com/cylc/cylc-ui/pull/275) - Fix size of dashboard
links on hover.

[#254](https://github.com/cylc/cylc-ui/pull/254) -  Keep cache in sync,
and use a global event bus.

[#284](https://github.com/cylc/cylc-ui/pull/284) -  Use data from
JupyterHub to create the Hub URL (handling base_url).

[#297](https://github.com/cylc/cylc-ui/pull/297) - Support IE and Safari

[#306](https://github.com/cylc/cylc-ui/pull/306) - Dismissing alerts leave
a blank space in the page

[#341](https://github.com/cylc/cylc-ui/pull/341) - Fix toolbar (responsive
mode and drawer)

[#361](https://github.com/cylc/cylc-ui/pull/361) - Remove the unneeded footer
component

[#370](https://github.com/cylc/cylc-ui/pull/370) - Fix up the old gscan table
view and move access to the dashboard.

[#396](https://github.com/cylc/cylc-ui/pull/396) - Fix leaf and other tree
nodes layout.

[#432](https://github.com/cylc/cylc-ui/pull/432) - Add loading state to
Lumino widgets with skeleton loaders, preventing it from displaying the
data of other workflows for a brief moment.

### Documentation

[#215](https://github.com/cylc/cylc-ui/pull/215) - guide: add beginnings
of a user guide.

### Security issues

None.

-------------------------------------------------------------------------------
## __cylc-ui-0.1 (2019-09-18)__

Initial release of Cylc UI.
