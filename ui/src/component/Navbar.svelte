<script>
    import {
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        NavHamburger,
        Button,
        Input,
        Avatar,
        Dropdown,
        DropdownHeader,
        DropdownItem,
        DropdownDivider,
        Chevron,
    } from 'flowbite-svelte';

    import utils from '../utils';
    import { user } from '../global/user.js';

    let logoutModal = false;

    async function logout(){
        await utils.post_json('/api/auth/logout');
        window.location.href = '/'
    }

</script>

<Navbar let:hidden let:toggle class="bg-slate-100">
    <NavBrand href="/">
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
        <NavLi id="master" class="cursor-pointer"><Chevron aligned>Master</Chevron></NavLi>
        <NavLi class="cursor-pointer" href="/#/task">Tasks</NavLi>
        <NavLi id="archived" class="cursor-pointer"><Chevron aligned>Archived</Chevron></NavLi>
        <NavLi id="deleted" class="cursor-pointer"><Chevron aligned>Deleted</Chevron></NavLi>
        <NavLi id="register" class="cursor-pointer"><Chevron aligned>Registers</Chevron></NavLi>
        <NavLi id="template" class="cursor-pointer"><Chevron aligned>Templates</Chevron></NavLi>
        <NavLi id="billing" class="cursor-pointer"><Chevron aligned>Billing</Chevron></NavLi>

        <Dropdown class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#master">
            <DropdownItem href="/#/client">Client</DropdownItem>
            <DropdownItem href="/#/company">Company</DropdownItem>
            <DropdownItem href="/#/service">Service</DropdownItem>
            <DropdownItem href="/#/role">Role</DropdownItem>
            <DropdownItem href="/#/lead">Leads</DropdownItem>
            <DropdownItem href="/#/employee">Employee</DropdownItem>
        </Dropdown>
    
        <Dropdown class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#archived">
            <DropdownItem href="/#/">GST 1</DropdownItem>
            <DropdownItem href="/#/">GST 3B</DropdownItem>
            <DropdownItem href="/#/">IT</DropdownItem>
        </Dropdown>
    
        <Dropdown class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#deleted">
            <DropdownItem href="/#/deleted/client">Client</DropdownItem>
            <DropdownItem href="/#/deleted/company">Company</DropdownItem>
            <DropdownItem href="/#/deleted/employee">Employee</DropdownItem>
            <DropdownItem href="/#/deleted/register">Register</DropdownItem>
            <DropdownItem href="/#/deleted/invoice">Invoice</DropdownItem>
        </Dropdown>
    
        <Dropdown class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#register">
            <DropdownItem href="/#/">GST 1</DropdownItem>
            <DropdownItem href="/#/">GST 3B</DropdownItem>
            <DropdownItem href="/#/">IT</DropdownItem>
        </Dropdown>
    
        <Dropdown class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#template">
            <DropdownItem href="/#/register_template">Register Template</DropdownItem>
            <DropdownItem href="/#/master_template">Master Template</DropdownItem>
            <DropdownItem href="/#/invoice_template">Invoice Template</DropdownItem>
        </Dropdown>
    
        <Dropdown class="w-[90vw] md:w-44" placement="bottom" triggeredBy="#billing">
            <DropdownItem href="/#/">Invoice</DropdownItem>
            <DropdownItem href="/#/">Pending Invoice</DropdownItem>
            <DropdownItem href="/#/">Generate Invoice</DropdownItem>
        </Dropdown>
    
    </NavUl>

    <div class="flex md:order-2">
        <Avatar class="!bg-white cursor-pointer" id="avatar" >A</Avatar>
        <NavHamburger on:click={toggle} />
    </div>
    
    <Dropdown placement="bottom" triggeredBy="#avatar">
        <DropdownHeader>
        <span class="block text-sm"> Admin </span>
        <span class="block truncate text-sm font-light"> admin </span>
        </DropdownHeader>
        <DropdownItem on:click={logout}>Sign out</DropdownItem>
    </Dropdown>
</Navbar>