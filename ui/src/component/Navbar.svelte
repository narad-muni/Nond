<script>
    import {
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        NavHamburger,
        Avatar,
        Dropdown,
        DropdownHeader,
        DropdownItem,
        Chevron,
    } from 'flowbite-svelte';

    import utils from '../utils';
    import { user, active_registers, archived_registers } from '../global/stores.js';

    let _active_registers, _archived_registers;

    active_registers.subscribe(val => {
        (async () => {
            _active_registers = await utils.get('/api/register_master/options/active');
            _archived_registers = await utils.get('/api/register_master/options/archived');

            _archived_registers = _archived_registers.reduce(function (a, b) {
                a[b.name] = a[b.name] || [];
                a[b.name].push(b);
                return a;
            }, Object.create(null));

        })();
    });

    archived_registers.subscribe(val => {
        (async () => {
            _active_registers = await utils.get('/api/register_master/options/active');
            _archived_registers = await utils.get('/api/register_master/options/archived');

            _archived_registers = _archived_registers.reduce(function (a, b) {
                a[b.name] = a[b.name] || [];
                a[b.name].push(b);
                return a;
            }, Object.create(null));
        })();
    });

    async function logout(){
        await utils.post_json('/api/auth/logout');
        window.location.href = '/'
    }

</script>

<Navbar let:hidden let:toggle class="!bg-slate-100">
    <NavBrand href="#">
        <img
        src="logo.png"
        class="mr-3 h-6 sm:h-9"
        alt="Nond Logo"
        />
        <span class="self-center whitespace-nowrap text-xl font-semibold">
        Nond
        </span>
    </NavBrand>
    
    <NavUl {hidden} class="order-1">
        {#if utils.getArrIntersection(Object.keys($user.role.read),['client','company','service','role','lead','employee']).length}
            <NavLi id="master" class="cursor-pointer"><Chevron aligned>Master</Chevron></NavLi>
        {/if}
        {#if $user.role.read.task}
            <NavLi href="/#/task" class="cursor-pointer">Task</NavLi>
        {/if}
        <NavLi id="archived" class="cursor-pointer"><Chevron aligned>Archived</Chevron></NavLi>
        {#if utils.getArrIntersection(Object.keys($user.role.read),['client','company','register','invoice','employee']).length}
            <NavLi id="deleted" class="cursor-pointer"><Chevron aligned>Deleted</Chevron></NavLi>
        {/if}
        {#if $user.role.read.register}
            <NavLi id="register" class="cursor-pointer"><Chevron aligned>Registers</Chevron></NavLi>
        {/if}
        {#if utils.getArrIntersection(Object.keys($user.role.read),['master_template','invoice_template','register_template']).length}
            <NavLi id="template" class="cursor-pointer"><Chevron aligned>Templates</Chevron></NavLi>
        {/if}
        {#if $user.role.read.invoice}
            <NavLi href="/#/invoice" class="cursor-pointer">Invoice</NavLi>
        {/if}

        {#if $user.role.read.automator}
            <NavLi href="/#/automator" class="cursor-pointer">Automator</NavLi>
        {/if}

        {#if $user.role.read.report}
            <NavLi href="/#/report" class="cursor-pointer">Reports</NavLi>
        {/if}

        <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#master">
            {#if $user.role.read.client}
                <DropdownItem href="/#/client">Client</DropdownItem>
            {/if}
            {#if $user.role.read.company}
                <DropdownItem href="/#/company">Company</DropdownItem>
            {/if}
            {#if $user.role.read.service}
                <DropdownItem href="/#/service">Service</DropdownItem>
            {/if}
            {#if $user.role.read.role}
                <DropdownItem href="/#/role">Role</DropdownItem>
            {/if}
            {#if $user.role.read.register_master}
                <DropdownItem href="/#/register_master">Registers</DropdownItem>
            {/if}
            {#if $user.role.read.lead}
                <DropdownItem href="/#/lead">Leads</DropdownItem>
            {/if}
            {#if $user.role.read.employee}
                <DropdownItem href="/#/employee">Employee</DropdownItem>
            {/if}
        </Dropdown>

        <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#archived">
            <DropdownItem href="/#/archived_tasks">Tasks</DropdownItem>
            {#if $user.role.read.company}
                <DropdownItem href="/#/archived_invoices">Invoices</DropdownItem>
            {/if}
            {#if $user.role.read.employee}
                <DropdownItem class="flex items-center justify-between"><Chevron placement="right">Registers</Chevron></DropdownItem>
                <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="right">
                    {#each Object.keys(_archived_registers) as register_name}
                        <DropdownItem class="flex items-center justify-between"><Chevron placement="right">{register_name}</Chevron></DropdownItem>
                        <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="right">
                            {#each _archived_registers[register_name] as register}
                                <DropdownItem href="/#/archived_register/{register.id}">{register.version}</DropdownItem>
                            {/each}
                        </Dropdown>
                    {/each}
                </Dropdown>
            {/if}
        </Dropdown>
    
        <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#deleted">
            {#if $user.role.read.client}
                <DropdownItem href="/#/deleted/client">Client</DropdownItem>
            {/if}
            {#if $user.role.read.company}
                <DropdownItem href="/#/deleted/company">Company</DropdownItem>
            {/if}
            {#if $user.role.read.employee}
                <DropdownItem href="/#/deleted/employee">Employee</DropdownItem>
            {/if}
        </Dropdown>
    
        <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#register">
            {#each _active_registers as register}
                <DropdownItem href="/#/register/{register.id}">{register.name}</DropdownItem>
            {/each}
        </Dropdown>
    
        <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#template">
            {#if $user.role.read.register_template}
                <DropdownItem id="register_template" class="flex items-center justify-between"><Chevron placement="right">Register Template</Chevron></DropdownItem>
                <Dropdown trigger="hover" class="w-[90vw] md:w-44" placement="right">
                    {#each _active_registers as register}
                        <DropdownItem href="/#/register_template/{register.id}">{register.name}</DropdownItem>
                    {/each}
                </Dropdown>
            {/if}
            {#if $user.role.read.master_template}
                <DropdownItem href="/#/master_template">Master Template</DropdownItem>
            {/if}
            {#if $user.role.read.task_template}
                <DropdownItem href="/#/task_template">Task Template</DropdownItem>
            {/if}
        </Dropdown>
    
    </NavUl>

    <div class="flex md:order-2">
        <Avatar class="!bg-white cursor-pointer" id="avatar" >{$user.username.charAt(0).toUpperCase()}</Avatar>
        <NavHamburger on:click={toggle} />
    </div>
    
    <Dropdown trigger="hover" placement="bottom" triggeredBy="#avatar">
        <DropdownHeader>
            <span class="block text-sm"> {$user.username.charAt(0).toUpperCase() + $user.username.slice(1)} </span>
            <span class="block truncate text-sm font-light"> {$user.role.name} </span>
        </DropdownHeader>
        <DropdownItem on:click={logout}>Sign out</DropdownItem>
    </Dropdown>
</Navbar>